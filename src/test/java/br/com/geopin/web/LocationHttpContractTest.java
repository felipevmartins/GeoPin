package br.com.geopin.web;

import java.util.Date;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.converter.json.JacksonJsonHttpMessageConverter;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.filter.HiddenHttpMethodFilter;
import br.com.geopin.model.Location;
import br.com.geopin.service.LocationService;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

class LocationHttpContractTest {
    private final JsonMapper mapper = new JsonConfiguration().jsonMapper();
    private Location saved;
    private MockMvc mvc;

    @BeforeEach
    void setup() {
        saved = new Location();
        saved.setId(42);
        saved.setName("São Paulo <mapa>");
        saved.setLatitude(0);
        saved.setLongitude(-46.63f);
        saved.setDataCriacao(new Date(1700000000123L));
        LocationService service = new LocationService() {
            @Override public Location get(int id) {
                assertEquals(42, id);
                return saved;
            }
            @Override public void salvar(Location location) {
                saved = location;
            }
        };
        LocationController controller = new LocationController();
        ReflectionTestUtils.setField(controller, "locationService", service);
        mvc = MockMvcBuilders.standaloneSetup(controller)
                .setMessageConverters(new JacksonJsonHttpMessageConverter(mapper))
                .addFilters(new HiddenHttpMethodFilter())
                .build();
    }

    @Test
    void coordinateResponsePreservesNamesUtf8ZeroAndEpochMilliseconds() throws Exception {
        var response = mvc.perform(get("/location/buscar/42")).andReturn().getResponse();
        assertEquals(200, response.getStatus());
        assertTrue(response.getContentType().startsWith("application/json"));
        JsonNode json = mapper.readTree(response.getContentAsByteArray());
        assertEquals(6, json.size());
        assertEquals(42, json.get("id").intValue());
        assertEquals("São Paulo <mapa>", json.get("name").stringValue());
        assertEquals(0, json.get("latitude").doubleValue());
        assertEquals(-46.63, json.get("longitude").doubleValue(), 0.0001);
        assertTrue(json.get("tags").isNull());
        assertTrue(json.get("dataCriacao").isNumber());
        assertEquals(1700000000123L, json.get("dataCriacao").longValue());
    }

    @Test
    void editFormStillOverridesPostToPutAndBindsCoordinates() throws Exception {
        var response = mvc.perform(post("/location/editar/42")
                .param("_method", "PUT").param("name", "Lugar editado")
                .param("latitude", "-90").param("longitude", "180"))
                .andReturn().getResponse();
        assertEquals(302, response.getStatus());
        assertEquals("../editar", response.getRedirectedUrl());
        assertEquals("Lugar editado", saved.getName());
        assertEquals(-90f, saved.getLatitude());
        assertEquals(180f, saved.getLongitude());
        assertEquals(1700000000123L, saved.getDataCriacao().getTime());
    }
}
