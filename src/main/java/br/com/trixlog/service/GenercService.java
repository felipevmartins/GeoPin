package br.com.trixlog.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import br.com.trixlog.dao.GenericDao;
import br.com.trixlog.model.BaseModel;

public class GenercService {
	
	@Autowired
	GenericDao genericDao;

	@Transactional
	public void salvar(BaseModel bm) throws Exception {
		genericDao.salvar(bm);
	}
	@Transactional
	public void deletar(BaseModel bm) throws Exception {
		genericDao.deletar(bm);
	}

	@Transactional(readOnly=true)
	@SuppressWarnings("rawtypes")
	public <T extends BaseModel> List<T> listarTodos(Class<T> bm) throws Exception {
		return genericDao.listarTodos(bm);
	}
}
