import React, { useState, useEffect } from "react";
import {
  View,
  ImageBackground,
  Text,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import RNPickerSelect from "react-native-picker-select";

import { Feather as Icon } from "@expo/vector-icons";
import styles from "./style";
import axios from "axios";

interface IIBGEResponse {
  sigla: string;
}
interface IIBGECityResponse {
  nome: string;
}
const Home: React.FC = () => {
  const navigation = useNavigation();

  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedUf, setSelectedUf] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  function handleClick() {
    if (selectedUf && selectedCity) {
      navigation.navigate("Points", { uf: selectedUf, city: selectedCity });
    } else {
      Alert.alert("Oops ..", "Preencha os Campos para continuar");
    }
  }

  useEffect(() => {
    if (selectedUf === "0") return;

    axios
      .get<IIBGECityResponse[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
      )
      .then((response) => {
        const cityNames = response.data.map((city) => city.nome);

        setCities(cityNames);
      });
  }, [selectedUf]);

  useEffect(() => {
    axios
      .get<IIBGEResponse[]>(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
      )
      .then((response) => {
        const ufInitials = response.data.map((uf) => uf.sigla);

        setUfs(ufInitials);
      });
  }, []);
  return (
    <ImageBackground
      style={styles.container}
      source={require("../../assets/home-background.png")}
      imageStyle={{ width: 274, height: 368 }}
    >
      <View style={styles.main}>
        <Image source={require("../../assets/logo.png")} />
        <View>
          <Text style={styles.title}>
            Seu Marketplace de coleta de resíduos
          </Text>
          <Text style={styles.description}>
            Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <RNPickerSelect
          value={selectedUf}
          style={pickerSelectStyles}
          placeholder={{
            label: "Selecione o Estado",
          }}
          useNativeAndroidPickerStyle={false}
          onValueChange={setSelectedUf}
          items={ufs?.map((uf) => ({
            label: uf,
            value: uf,
          }))}
        />
        <RNPickerSelect
          // value={selectedUf}
          style={pickerSelectStyles}
          placeholder={{
            label: "Selecione a Cidade",
          }}
          value={selectedCity}
          useNativeAndroidPickerStyle={false}
          disabled={selectedUf ? false : true}
          onValueChange={setSelectedCity}
          items={cities?.map((city) => ({
            label: city,
            value: city,
          }))}
        />

        <RectButton style={styles.button} onPress={handleClick}>
          <View style={styles.buttonIcon}>
            <Icon name="arrow-right" color="#FFF" size={24} />
          </View>
          <Text style={styles.buttonText}> Entrar </Text>
        </RectButton>
      </View>
    </ImageBackground>
  );
};
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    paddingVertical: 12,
    color: "gray",
    paddingRight: 30, // to ensure the text is never behind the icon
    height: 60,
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },
  inputAndroid: {
    paddingVertical: 8,
    color: "gray",
    paddingRight: 30, // to ensure the text is never behind the icon
    height: 60,
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },
});

export default Home;
