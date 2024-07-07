import axios from "axios";
import { z } from "zod";
import { SearchType } from "../types";
import { useMemo, useState } from "react";

// Zod
const WeatherSchema = z.object({
    name: z.string(),
    main: z.object({
        temp: z.number(),
        temp_max: z.number(),
        temp_min: z.number(),
    })
});

export type Weather = z.infer<typeof WeatherSchema>;

const initialState = {
    name: '',
    main: {
        temp: 0,
        temp_max: 0,
        temp_min: 0
    }
}

const useWeather = () => {
    const [weather, setWeather] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [notFound, setNotFound] = useState(false);

    const fetchWeather = async (search: SearchType) => {
        setLoading(true);
        setWeather(initialState);
        setNotFound(false);

        try {
            // Buscar latitud y longitud
            const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${search.city},${search.country}&&appid=${import.meta.env.VITE_API_KEY}`;
            const { data } = await axios(geoUrl);

            // Comprobar si existe la ciudad
            if(!data[0]) {
                setNotFound(true);
                return;
            }

            const lat = data[0].lat;
            const lon = data[0].lon;

            // Buscar el clima
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_API_KEY}`;
            const { data: weatherResult } = await axios(weatherUrl);

            // Comprobar si la respuesta de la petición es como el esquema definido con ZOD
            const result = WeatherSchema.safeParse(weatherResult);

            if (result.success) {
                setWeather(result.data);
            }

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const hasWeatherData = () => useMemo(() => weather.name, [weather]);

    return {
        weather,
        loading,
        notFound,
        fetchWeather,
        hasWeatherData
    }
}

export default useWeather;