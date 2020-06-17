import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import logo from "../../assets/logo.svg";
import swal from "sweetalert";
import { Link, useHistory } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Map, TileLayer, Marker } from "react-leaflet";
import { LeafletMouseEvent } from "leaflet";
import Dropzone from "../../components/Dropzone";
import api from "../../services/api";
import axios from "axios";

import "./styles.css";

interface Item {
  id: number;
  title: string;
  img_url: string;
}
interface State {
  id: number;
  nome: string;
  sigla: string;
}
interface City {
  id: number;
  nome: string;
}

const CreatePoint: React.FC = () => {
  const history = useHistory();

  const [items, setItems] = useState<Item[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });

  const [selectedState, setSelectedState] = useState("0");
  const [selectedCity, setSelectedCity] = useState("0");
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([
    0,
    0,
  ]);

  const [selectedFile, setSelectedFile] = useState<File>();

  async function getStates() {
    const response = await axios.get(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
    );
    setStates(response.data);
  }
  async function getItems() {
    const response = await api.get(`/getItems`);
    setItems(response.data);
  }
  async function handleStateChange(sigla: string) {
    const response = await axios.get(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${sigla}/municipios`
    );
    setCities(response.data);
    setSelectedState(sigla);
  }
  function handleCityChange(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;

    setSelectedCity(city);
  }
  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([event.latlng.lat, event.latlng.lng]);
  }
  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }
  function handleSelectedItem(id: number) {
    const selected = selectedItems.findIndex((item) => item === id);

    if (selected >= 0) {
      const filteredItems = selectedItems.filter((item) => item !== id);
      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedState;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = new FormData()

      data.append('name',name);
      data.append('email',email);
      data.append('whatsapp',whatsapp);
      data.append('uf',uf);
      data.append('city',city);
      data.append('latitude',String(latitude));
      data.append('longitude',String(longitude));
      data.append('items',items.join(','));
      if (selectedFile) {
        data.append('image',selectedFile);
      }

    await api.post("createPoint", data);

    swal({
      title: "Sucesso!",
      text: "Ponto de Coleta criado com suceso!",
      icon: "success",
    }).then(() => {
      history.push("/");
    });
  }
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      setInitialPosition([latitude, longitude]);
    });
  }, []);
  useEffect(() => {
    getItems();
    getStates();
  }, []);
  return (
    <>
      <div id="page-create-point">
        <header>
          <img src={logo} alt="logo" />

          <Link to="/">
            <FiArrowLeft />
            Voltar para Home
          </Link>
        </header>
        <form onSubmit={handleSubmit}>
          <h1>
            Cadastro do
            <br /> Ponto de Coleta
          </h1>

          <Dropzone onFileUploaded={setSelectedFile} />
          <fieldset>
            <legend>
              <h2>Dados</h2>
            </legend>
            <div className="field">
              <label htmlFor="name"> Nome da Entidade</label>
              <input
                onChange={handleInputChange}
                type="text"
                name="name"
                id="name"
              />
            </div>
            <div className="field-group">
              <div className="field">
                <label htmlFor="name">E-Mail</label>
                <input
                  onChange={handleInputChange}
                  type="email"
                  name="email"
                  id="email"
                />
              </div>
              <div className="field">
                <label htmlFor="name">Whatsapp</label>
                <input
                  onChange={handleInputChange}
                  type="text"
                  name="whatsapp"
                  id="whatsapp"
                />
              </div>
            </div>
          </fieldset>
          <fieldset>
            <legend>
              <h2>Endereço</h2>
              <span>Selecione um endereço no mapa</span>
            </legend>
            <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
              <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />{" "}
              <Marker position={selectedPosition} />
            </Map>
            <div className="field-group">
              <div className="field">
                <label htmlFor="uf">Estado (UF)</label>
                <select
                  onChange={(e) => {
                    handleStateChange(e.target.value);
                  }}
                  value={selectedState}
                  name="uf"
                  id="uf"
                >
                  <option value="0">Selcione um UF</option>
                  {states.map((state) => (
                    <option key={state.id} value={state.sigla}>
                      {state.sigla}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="city">Cidade</label>
                <select
                  value={selectedCity}
                  onChange={handleCityChange}
                  name="city"
                  id="city"
                >
                  <option value="0">Selcione uma Cidade</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.nome}>
                      {city.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <legend>
              <h2>ítens de Coleta</h2>
              <span>Selecione um ou mais itens abaixo</span>
            </legend>
            <ul className="items-grid">
              {items.map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleSelectedItem(item.id)}
                  className={selectedItems.includes(item.id) ? "selected" : ""}
                >
                  <img src={item.img_url} alt={item.title} />
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>
          </fieldset>

          <button type="submit">Cadastrar ponto de coleta</button>
        </form>
      </div>
    </>
  );
};

export default CreatePoint;
