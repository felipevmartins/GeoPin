package br.com.trixlog.dao;

import java.util.List;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import br.com.trixlog.model.BaseModel;

public class GenericDao {

    @PersistenceContext
    protected EntityManager entityManager;

    public void salvar(BaseModel model) {
        // merge also accepts new entities referencing detached, existing parents.
        BaseModel managed = entityManager.merge(model);
        model.setId(managed.getId());
    }

    public void deletar(BaseModel model) {
        BaseModel managed = entityManager.contains(model) ? model : entityManager.merge(model);
        entityManager.remove(managed);
    }

    public <T extends BaseModel> List<T> listarTodos(Class<T> type) {
        return entityManager.createQuery("from " + type.getSimpleName(), type).getResultList();
    }
}
