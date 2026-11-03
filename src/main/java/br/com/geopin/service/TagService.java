package br.com.geopin.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.geopin.dao.TagDao;
import br.com.geopin.model.BaseModel;
import br.com.geopin.model.Location;
import br.com.geopin.model.Tag;

@Service
public class TagService {
	
	@Autowired
	TagDao tagDao;
	
	@Transactional
	public Tag get(int id) {
		return tagDao.get(id);
	}
	@Transactional
	public List<Tag> getList(Location location) {
		return tagDao.getList(location);
	}
	
	@Transactional
	public void salvar(Tag tag) throws Exception {
		tagDao.salvar(tag);
	}
	@Transactional
	public void deletar(Tag tag) throws Exception {
		tagDao.deletar(tag);
	}

	@Transactional(readOnly=true)
	@SuppressWarnings("rawtypes")
	public List<Tag> listarTodos() throws Exception {
		return tagDao.listarTodos(Tag.class);
	}
}
