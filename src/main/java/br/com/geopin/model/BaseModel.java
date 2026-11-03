package br.com.geopin.model;

import java.io.Serializable;
import java.lang.reflect.InvocationTargetException;

import jakarta.persistence.MappedSuperclass;

import org.apache.commons.beanutils.BeanUtils;

@MappedSuperclass
public abstract class BaseModel implements Serializable{

	/**
	 * 
	 */
	private static final long serialVersionUID = 7736710221797500486L;
	
	public abstract int getId();
	
	public abstract void setId(int id);
	
	@Override
	public boolean equals(Object obj)
	{
		BaseModel bm = (BaseModel)obj;	
		return (this.getId() == bm.getId());
	}
	
	@Override
	public Object clone() {
		try {
			Object obj = new Object();
			BeanUtils.copyProperties(obj, this);
			return obj;
		} catch (IllegalAccessException e) {
			return null;
		} catch (InvocationTargetException e) {
			return null;
		}
	}
	
}
