import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { Feather as Icon } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps";
import { SvgUri } from "react-native-svg";
import * as Location from "expo-location";
import api from "../../services/api";
import styles from "./style";

interface Item {
  id: number;
  title: string;
  img_url: string;
}
interface Point {
  id: number;
  image: string;
  name: string;
  latitude: number;
  longitude: number;
  image_url: string
}
interface Params {
  uf: string;
  city: string;
}

const Points: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const routeParams = route.params as Params

  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [initialPosition, setIintialPosition] = useState<[number, number]>([
    0,
    0,
  ]);

  function handleSelectedItem(id: number) {
    const selected = selectedItems.findIndex((item) => item === id);

    if (selected >= 0) {
      const filteredItems = selectedItems.filter((item) => item !== id);
      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }

  async function getItems() {
    const response = await api.get("getItems");
    setItems(response.data);
  }
  async function getPoints() {
    const response = await api
      .get("points", {
        params: {
          city: routeParams.city,
          uf: routeParams.uf,
          items: selectedItems,
        },
      })
      .then((response) => {
        setPoints(response.data);
      });
  }
  useEffect(() => {
    async function loadPosition() {
      const { status } = await Location.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Oops..",
          "Precisamos da sua permissão para obter a localização"
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync();
      const { latitude, longitude } = location.coords;

      setIintialPosition([latitude, longitude]);
    }
    loadPosition();
  }, []);

  useEffect(() => {
    getItems();
  }, []);
  useEffect(() => {
    getPoints();
  }, [selectedItems]);

  function handleNavigateBack() {
    navigation.goBack();
  }
  function handleNavigateDetail(id: number) {
    navigation.navigate("Details", { point_id: id });
  }

  return (
    <>
      <View style={styles.container}>
     
        <TouchableOpacity activeOpacity={0.6} onPress={handleNavigateBack}>
          <Icon name="arrow-left" size={25} color="#34cb79" />
        </TouchableOpacity>
        <Text style={styles.title}>💚 Bem Vindo</Text>
        <Text style={styles.description}>
          🌎 Encontre no mapa um ponto de coleta próximo a {routeParams.city}/{routeParams.uf}
        </Text>
        <View style={styles.mapContainer}>
          {initialPosition[0] !== 0 && (
            <MapView
              style={styles.map}
              loadingEnabled={initialPosition[0] === 0}
              initialRegion={{
                latitude: initialPosition[0],
                longitude: initialPosition[1],
                longitudeDelta: 0.014,
                latitudeDelta: 0.014,
              }}
            >
              {points.map((point) => (
                <Marker
                  key={point.id}
                  onPress={() => {
                    handleNavigateDetail(point.id);
                  }}
                  style={styles.mapMarker}
                  coordinate={{
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }}
                >
                  <View style={styles.mapMarkerContainer}>
                    <Image
                      style={styles.mapMarkerImage}
                      source={{
                        uri: point.image_url,
                      }}
                    />
                    <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                  </View>
                </Marker>
              ))}
            </MapView>
          )}
        </View>
      </View>
      <View style={styles.itemsContainer}>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          horizontal={true}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.item,
                selectedItems.includes(item.id) ? styles.selectedItem : {},
              ]}
              activeOpacity={0.5}
              onPress={() => {
                handleSelectedItem(item.id);
              }}
            >
              <SvgUri width={42} height={42} uri={item.img_url} />
              <Text style={styles.itemTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );
};

export default Points;
