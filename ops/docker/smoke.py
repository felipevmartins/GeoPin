#!/usr/bin/env python3
"""HTTP + PostgreSQL regression against this checkout's isolated Compose stack."""
import json
import os
from pathlib import Path
import subprocess
from urllib.parse import urlencode
from urllib.request import Request, urlopen
import uuid

ROOT = Path(__file__).resolve().parents[2]
BASE = 'http://127.0.0.1:' + (os.environ.get('GEOPIN_HTTP_PORT') or os.environ.get('TRIXLOG_HTTP_PORT', '18081'))
NAME = 'Teste São Paulo ' + uuid.uuid4().hex


def sql(statement):
    return subprocess.check_output(
        ['docker', 'compose', 'exec', '-T', 'db', 'psql', '-U', 'geopin',
         '-d', 'geopin', '-At', '-v', 'ON_ERROR_STOP=1', '-c', statement],
        cwd=ROOT, text=True).strip()


def http(path, method='GET', **fields):
    data = urlencode(fields).encode() if fields else None
    headers = {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
    with urlopen(Request(BASE + path, data=data, headers=headers, method=method), timeout=20) as response:
        assert response.status == 200, response.status
        return response.read().decode('utf-8')


location_id = None
try:
    assert 'navbar' in http('/')
    http('/location/cadastrar', 'POST', name=NAME, latitude='-23.55', longitude='-46.63')
    location_id = sql("SELECT id FROM locations WHERE name = '" + NAME + "'")
    assert location_id.isdigit(), 'Location was not persisted'
    location = json.loads(http('/location/buscar/' + location_id))
    assert location['name'] == NAME, location
    assert abs(location['latitude'] + 23.55) < 0.001, location
    http('/tag/cadastrar', 'POST', idlocation=location_id, name='Tag São Paulo')
    assert 'Tag São Paulo' in json.loads(http('/tag/tags/' + location_id))
    http('/tag/cadastrar', 'POST', idlocation=location_id, name='Segunda tag')
    assert set(json.loads(http('/tag/tags/' + location_id))) == {'Tag São Paulo', 'Segunda tag'}
    assert sql("SELECT count(*) FROM locations WHERE name = '" + NAME + "'") == '1'
    assert sql('SELECT count(*) FROM tags WHERE location_id = ' + location_id) == '2'
    http('/location/editar/' + location_id, 'POST', _method='PUT', name=NAME + ' editado', latitude='-22.9', longitude='-43.2')
    assert sql('SELECT name FROM locations WHERE id = ' + location_id) == NAME + ' editado'
    updated = json.loads(http('/location/buscar/' + location_id))
    assert updated['dataCriacao'] == location['dataCriacao']
    assert isinstance(updated['dataCriacao'], int)
    assert set(json.loads(http('/tag/tags/' + location_id))) == {'Tag São Paulo', 'Segunda tag'}
    assert 'navbar' in http('/location/listar')
    http('/location/deletar/' + location_id, 'POST', _method='DELETE')
    assert sql('SELECT count(*) FROM locations WHERE id = ' + location_id) == '0'
    assert sql('SELECT count(*) FROM tags WHERE location_id = ' + location_id) == '0'
    print('PASS: JSP, location create/read/update/delete, tag association, JSON, UTF-8 and database persistence')
finally:
    if location_id and location_id.isdigit():
        sql('DELETE FROM tags WHERE location_id = ' + location_id)
        sql('DELETE FROM locations WHERE id = ' + location_id)
