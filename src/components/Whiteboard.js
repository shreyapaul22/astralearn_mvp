import React, { useState, forwardRef, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, PanResponder } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';

const Whiteboard = forwardRef(({ paths, onPathsChange, onClear }, ref) => {
  const currentPathRef = useRef(null);
  const pathsRef = useRef(paths); // Keep track of latest paths
  const [, forceUpdate] = useState(0); // Force re-render counter

  // Update pathsRef whenever paths change
  pathsRef.current = paths;

  // PanResponder for touch handling (onTouch not working in this Skia version)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        console.log('🎨 Touch START detected');
        return true;
      },
      onStartShouldSetPanResponderCapture: () => {
        console.log('🎨 Touch START CAPTURE (iOS)');
        return true;
      },
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        console.log('🎨 Starting new path at:', locationX, locationY);
        console.log('🎨 Current saved paths:', pathsRef.current.length);
        
        const path = Skia.Path.Make();
        path.moveTo(locationX, locationY);
        currentPathRef.current = {
          path,
          color: '#000000',
          strokeWidth: 3,
        };
        forceUpdate(prev => prev + 1);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        
        if (currentPathRef.current) {
          currentPathRef.current.path.lineTo(locationX, locationY);
          forceUpdate(prev => prev + 1);
        }
      },
      onPanResponderRelease: () => {
        console.log('🎨 Ending path, total paths will be:', pathsRef.current.length + 1);
        
        if (currentPathRef.current) {
          onPathsChange([...pathsRef.current, currentPathRef.current]);
          currentPathRef.current = null;
          forceUpdate(prev => prev + 1);
        }
      },
      onPanResponderTerminate: () => {
        if (currentPathRef.current) {
          onPathsChange([...pathsRef.current, currentPathRef.current]);
          currentPathRef.current = null;
          forceUpdate(prev => prev + 1);
        }
      },
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
    })
  ).current;

  return (
    <View style={styles.container}>
      <View 
        style={styles.canvasContainer} 
        ref={ref} 
        collapsable={false}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          console.log('📐 Canvas container size:', width, 'x', height);
        }}
      >
        <View 
          style={styles.touchLayer}
          {...panResponder.panHandlers}
          onTouchStart={() => console.log('👆 Touch layer - touch start')}
        >
          <Canvas 
            style={styles.canvas}
          >
          {/* Render all saved paths */}
          {paths.map((p, index) => (
            <Path
              key={`path-${index}`}
              path={p.path}
              color={p.color}
              style="stroke"
              strokeWidth={p.strokeWidth}
              strokeCap="round"
              strokeJoin="round"
            />
          ))}
          {/* Render current path being drawn */}
          {currentPathRef.current && (
            <Path
              path={currentPathRef.current.path}
              color={currentPathRef.current.color}
              style="stroke"
              strokeWidth={currentPathRef.current.strokeWidth}
              strokeCap="round"
              strokeJoin="round"
            />
          )}
          </Canvas>
        </View>
      </View>
      
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.clearButton} onPress={onClear}>
          <Text style={styles.clearButtonText}>🗑️ Clear</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>Draw your solution above</Text>
      </View>
    </View>
  );
});

export default Whiteboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden', // Prevent scroll bounce
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    marginBottom: 10,
  },
  touchLayer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  canvas: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  clearButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    color: '#6b7280',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

