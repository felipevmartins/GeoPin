package br.com.geopin.web;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
public class MapsConfiguration {
    @Autowired
    private Environment environment;

    @ModelAttribute
    public void addMapsConfiguration(Model model) {
        model.addAttribute("mapsApiKey", environment.getProperty("maps.api.key",
                environment.getProperty("GOOGLE_MAPS_API_KEY", "")));
        model.addAttribute("mapsMapId", environment.getProperty("maps.map.id",
                environment.getProperty("GOOGLE_MAPS_MAP_ID", "DEMO_MAP_ID")));
    }
}
