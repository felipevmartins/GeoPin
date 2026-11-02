package br.com.trixlog.web;

import java.util.Date;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import br.com.trixlog.model.Location;
import br.com.trixlog.service.LocationService;

@Controller
@RequestMapping("/location")
public class LocationController {

	@Autowired
	LocationService locationService;

	@RequestMapping(value = "/novo")
	public String novo() {
		return "location/novo";
	}

	@RequestMapping(value = "/cadastrar")
	public String cadastrar(Location location) {
		try {
			location.setDataCriacao(new Date());
			locationService.salvar(location);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return "home";
	}

	@RequestMapping(method = RequestMethod.GET, value = "/listar")
	public String listar(HttpServletRequest request) {
		try {
			Location locationPadrao = (Location) request
					.getAttribute("location");
			if (locationPadrao == null) {
				locationPadrao = new Location();
				locationPadrao.setLatitude((float) -3.7447435);
				locationPadrao.setLongitude((float) -38.5277421);

				request.setAttribute("location", locationPadrao);
				request.setAttribute("zoom", 13);
				request.setAttribute("plotar", "false");
			}
			request.setAttribute("listaLocations",
					locationService.listarTodos());
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return "location/listar";
	}

	@RequestMapping(method = RequestMethod.GET, value = "/editar")
	public String editar(HttpServletRequest request) {
		try {
			request.setAttribute("listaLocations",
					locationService.listarTodos());
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return "location/editar";
	}

	@RequestMapping(method = RequestMethod.PUT, value = "/editar/{id}")
	public String alterarlocation(@PathVariable int id, Location location) {
		System.out.println("here");
		Location locationAlterar = locationService.get(id);
		locationAlterar.setName(location.getName());
		locationAlterar.setLatitude(location.getLatitude());
		locationAlterar.setLongitude(location.getLongitude());
		try {
			locationService.salvar(locationAlterar);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return "redirect:../editar";
	}

	//
	@RequestMapping(method = RequestMethod.GET, value = "/deletar")
	public void pgdeletarlocation(HttpServletRequest request) {
		try {
			request.setAttribute("listaLocations",
					locationService.listarTodos());
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	@RequestMapping(method = RequestMethod.DELETE, value = "/deletar/{id}")
	public String deletarlocation(@PathVariable int id) {
		Location locationAlterar = locationService.get(id);

		try {
			locationService.deletar(locationAlterar);

		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return "redirect:../deletar";
	}

	//
	//
	//
	@RequestMapping(method = RequestMethod.GET, value = "/buscar/{id}")
	public @ResponseBody Location coordenadas(@PathVariable int id) {
		Location locationBD = locationService.get(id);
		locationBD.setTags(null);
		return locationBD;
	}

}
