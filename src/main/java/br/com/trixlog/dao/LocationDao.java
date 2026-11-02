package br.com.trixlog.dao;

import org.springframework.stereotype.Repository;
import br.com.trixlog.model.Location;

@Repository
public class LocationDao extends GenericDao {
    public Location get(int id) {
        return entityManager.find(Location.class, id);
    }
}
