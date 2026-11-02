package br.com.trixlog.dao;

import java.util.List;
import org.springframework.stereotype.Repository;
import br.com.trixlog.model.Location;
import br.com.trixlog.model.Tag;

@Repository
public class TagDao extends GenericDao {
    public Tag get(int id) {
        return entityManager.find(Tag.class, id);
    }

    public List<Tag> getList(Location location) {
        return entityManager.createQuery("from Tag t where t.location = :location", Tag.class)
                .setParameter("location", location)
                .getResultList();
    }
}
