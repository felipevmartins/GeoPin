package br.com.trixlog.web;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import br.com.trixlog.model.Location;
import br.com.trixlog.model.Tag;
import br.com.trixlog.service.LocationService;
import br.com.trixlog.service.TagService;

@Controller
@RequestMapping("/tag")
public class TagController {

	@Autowired
	private LocationService locationService;
	@Autowired
	private TagService tagService;

	@RequestMapping(value = "/novo")
	public String novo(HttpServletRequest request) {
		try {
			request.setAttribute("listaLocations",
					locationService.listarTodos());
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return "tag/novo";
	}
	
	@RequestMapping(method = RequestMethod.GET, value = "/tags/{id}")
	public @ResponseBody List<String> coordenadas(@PathVariable int id) {
		Location locationBD = locationService.get(id);
		List<Tag> tags = tagService.getList(locationBD);
		List<String> nomes = new ArrayList<String>();
		for (Tag tag : tags) {
			nomes.add(tag.getName());
		}
		return nomes;
	}
	
	
	
	@RequestMapping(value = "/cadastrar")
	public String cadastrarTag(int idlocation, Tag tag) {
		Location location = locationService.get(idlocation);
		tag.setDataCriacao(new Date());
		tag.setLocation(location);
		try {
			tagService.salvar(tag);
		} catch (Exception e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
		
		
		return "home";
	}
}
