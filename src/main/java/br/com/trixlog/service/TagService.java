package br.com.trixlog.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.trixlog.dao.TagDao;
import br.com.trixlog.model.BaseModel;
import br.com.trixlog.model.Location;
import br.com.trixlog.model.Tag;

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
