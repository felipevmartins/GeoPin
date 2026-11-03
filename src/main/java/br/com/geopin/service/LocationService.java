package br.com.geopin.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.geopin.dao.LocationDao;
import br.com.geopin.model.BaseModel;
import br.com.geopin.model.Location;

@Service
public class LocationService {
	
	@Autowired
	LocationDao locationDao;
	
	@Transactional
	public Location get(int id) {
		return locationDao.get(id);
	}
	
	@Transactional
	public void salvar(Location location) throws Exception {
		locationDao.salvar(location);
	}
	@Transactional
	public void deletar(Location location) throws Exception {
		locationDao.deletar(location);
	}

	@Transactional(readOnly=true)
	@SuppressWarnings("rawtypes")
	public List<Location> listarTodos() throws Exception {
		return locationDao.listarTodos(Location.class);
	}

}
