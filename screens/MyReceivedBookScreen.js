import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import db from '../config';
import firebase from 'firebase'; 

export default class MyReceivedBookScreen extends React.Component {
    constructor(){
        super();
        this.state = {

        }
    }
    render (){
        return(
<View>
    <Text>This is the received book screen.</Text>
</View>
    )}
}

const styles = StyleSheet.create({
    
})