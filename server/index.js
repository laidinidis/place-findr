import express from "express";
import cors from "cors";
import axios from "axios";

const GM_API_KEY = "AIzaSyAoUfOFS9NKd8b3s6C0AYdEraz7mf64C3E";

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.json({
    message: "ok",
    data: "test",
  });
});

app.get("/locations", async (req, res) => {
  try {
    const { input } = req.query;
    const { data } = await axios.get(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${input}&inputtype=textquery&key=${GM_API_KEY}&fields=business_status,formatted_address,geometry,icon,name,photos,place_id,plus_code,types`
    );

    res.json(data);
  } catch (error) {
    console.log(error);
    res.end();
  }
});

app.get("/places", async (req, res) => {
  try {
    const { type, location } = req.query;
    const { data } = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=2000&type=${type}&key=${GM_API_KEY}`
    );

    res.json(data);
  } catch (error) {
    console.log(error);
    res.end();
  }
});

app.get("/placeinfo", async (req, res) => {
  try {
    const { place_id } = req.query;
    const { data } = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${GM_API_KEY}`
    );

    res.json(data);
  } catch (error) {
    console.log(error);
    res.end();
  }
});

app.listen(3000, () => console.log("Listening on localhost:3000"));
