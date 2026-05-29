import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import {
  HomeScreen,
  CreateSnippetScreen,
  SnippetDetailsScreen,
  FavoritesScreen,
  FileManagerScreen,
  SettingsScreen,
} from '@screens/index';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Home Stack Navigator
const HomeStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#2196F3',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Code Snippets' }}
      />
      <Stack.Screen
        name="CreateSnippet"
        component={CreateSnippetScreen}
        options={{ title: 'New Snippet' }}
      />
      <Stack.Screen
        name="SnippetDetails"
        component={SnippetDetailsScreen}
        options={{ title: 'Snippet' }}
      />
    </Stack.Navigator>
  );
};

// Tab Navigator
export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: '#CCCCCC',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#EEEEEE',
            height: 60,
            paddingBottom: 8,
          },
          tabBarLabel: ({ color }) => {
            let label = '';
            if (route.name === 'HomeStack') label = 'Snippets';
            else if (route.name === 'Favorites') label = 'Favorites';
            else if (route.name === 'FileManager') label = 'Files';
            else if (route.name === 'Settings') label = 'Settings';

            return <></>;
          },
          tabBarIcon: ({ color, size }) => {
            let iconName = '';

            if (route.name === 'HomeStack') {
              iconName = '📝';
            } else if (route.name === 'Favorites') {
              iconName = '⭐';
            } else if (route.name === 'FileManager') {
              iconName = '📁';
            } else if (route.name === 'Settings') {
              iconName = '⚙️';
            }

            return (
              <Text
                style={{ fontSize: size, color }}
              >
                {iconName}
              </Text>
            );
          },
        })}
      >
        <Tab.Screen
          name="HomeStack"
          component={HomeStackNavigator}
          options={{
            title: 'Snippets',
          }}
        />
        <Tab.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            title: 'Favorites',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#FFFFFF',
            },
            headerTintColor: '#2196F3',
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
            },
          }}
        />
        <Tab.Screen
          name="FileManager"
          component={FileManagerScreen}
          options={{
            title: 'Files',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#FFFFFF',
            },
            headerTintColor: '#2196F3',
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
            },
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#FFFFFF',
            },
            headerTintColor: '#2196F3',
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 18,
            },
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

import { Text } from 'react-native';
