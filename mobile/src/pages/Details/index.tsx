import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Image, Text, Alert , Linking} from "react-native";
import { Feather as Icon, FontAwesome } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RectButton } from "react-native-gesture-handler";
import styles from "../Details/style";
import { SafeAreaView } from "react-native-safe-area-context";
import * as MailComposer from 'expo-mail-composer';

import api from '../../services/api'

interface Params {
  point_id: number;
}
interface Data {
  point:{
    id: number;
    image: string;
    image_url: string;
    name: string;
    email: string;
    whatsapp: string;
    city: string;
    uf: string;
  };
  items: {
    title: string;
  }[];
}

const Details: React.FC = () => {
  
  const navigation = useNavigation();
  const route = useRoute();

  const [data, setData] = useState<Data>({} as Data);
 
  const routeParams = route.params as Params;

  async function getPoint(){
    const response = await api.get(`points/${routeParams.point_id}`)
    setData(response.data)
  }
  function handleEmail (){
    MailComposer.composeAsync({
      recipients : [data.point.email],
      subject: 'Interesse na coleta de resíduos'
    })
  }

  function handleWhatsapp(){
    Linking.openURL(`whatsapp://send?phone=55${data.point.whatsapp}&text=Interesse na Coleta de Resíduos`)

  }
  useEffect(() => {
    getPoint();
  }, []);
  function handleNavigateBack() {
    navigation.goBack();
  }
  if (!data.point) {
    return null
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity activeOpacity={0.8} onPress={handleNavigateBack}>
          <Icon name="arrow-left" size={25} color="#34cb79" />
        </TouchableOpacity>
        <View style={styles.bxs}>
        <Image
          style={styles.pointImage}
          source={{
            uri: data.point.image_url,
          }}
        />
        </View>
        <Text style={styles.pointName}>{data.point.name}</Text>
        <Text style={styles.pointItems}>
          {data.items.map(item=> item.title).join(', ')}
        </Text>

        <View style={styles.address}>
          <Text style={styles.addressTitle}>Endereço</Text>
          <Text style={styles.addressContent}>{data.point.city}, {data.point.uf}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={handleWhatsapp}>
          <FontAwesome name="whatsapp" color="#FFF" size={20} />
          <Text style={styles.buttonText}> Whatsapp </Text>
        </RectButton>
        <RectButton style={styles.button} onPress={handleEmail}>
          <Icon name="mail" color="#FFF" size={20} />
          <Text style={styles.buttonText}> Email </Text>
        </RectButton>
      </View>
    </SafeAreaView>
  );
};

export default Details;
