import React, { useState, forwardRef, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, PanResponder } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';

const Whiteboard = forwardRef(({ paths, onPathsChange, onClear, mode = 'draw', onModeChange }, ref) => {
  const currentPathRef = useRef(null);
  const pathsRef = useRef(paths); // Keep track of latest paths
  const modeRef = useRef(mode); // Keep track of current mode
  const [, forceUpdate] = useState(0); // Force re-render counter
  
  // Update refs whenever they change
  pathsRef.current = paths;
  modeRef.current = mode;
  
  // Helper function to check if a point is near a path
  const isPointNearPath = (x, y, path, threshold = 15) => {
    try {
      const pathBounds = path.getBounds();
      // Small threshold for precise erasing - only erase where touched
      if (
        x >= pathBounds.x - threshold &&
        x <= pathBounds.x + pathBounds.width + threshold &&
        y >= pathBounds.y - threshold &&
        y <= pathBounds.y + pathBounds.height + threshold
      ) {
        return true;
      }
    } catch (e) {
      console.log('Error checking path bounds:', e);
    }
    return false;
  };

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
        const currentMode = modeRef.current;
        console.log(`🎨 Starting ${currentMode} at:`, locationX, locationY);
        
        if (currentMode === 'erase') {
          // Find and remove paths near the touch point
          const remainingPaths = pathsRef.current.filter((p, index) => {
            const isNear = isPointNearPath(locationX, locationY, p.path);
            if (isNear) {
              console.log(`🗑️ Erasing path ${index}`);
            }
            return !isNear;
          });
          onPathsChange(remainingPaths);
        } else {
          // Draw mode - create new path
          const path = Skia.Path.Make();
          path.moveTo(locationX, locationY);
          currentPathRef.current = {
            path,
            color: '#000000',
            strokeWidth: 3,
          };
          forceUpdate(prev => prev + 1);
        }
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const currentMode = modeRef.current;
        
        if (currentMode === 'erase') {
          // Continue erasing paths as user moves
          const remainingPaths = pathsRef.current.filter((p) => {
            return !isPointNearPath(locationX, locationY, p.path);
          });
          if (remainingPaths.length !== pathsRef.current.length) {
            onPathsChange(remainingPaths);
          }
        } else if (currentPathRef.current) {
          // Draw mode - continue drawing
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
        <View style={styles.toolButtons}>
          <TouchableOpacity 
            style={[styles.toolButton, mode === 'draw' && styles.activeToolButton]} 
            onPress={() => onModeChange?.('draw')}
          >
            <Text style={[styles.toolButtonText, mode === 'draw' && styles.activeToolButtonText]}>
              ✏️ Draw
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.toolButton, mode === 'erase' && styles.activeToolButton]} 
            onPress={() => onModeChange?.('erase')}
          >
            <Text style={[styles.toolButtonText, mode === 'erase' && styles.activeToolButtonText]}>
              🧹 Erase
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.clearButton} onPress={onClear}>
          <Text style={styles.clearButtonText}>🗑️ Clear All</Text>
        </TouchableOpacity>
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
    gap: 10,
  },
  toolButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  toolButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  activeToolButton: {
    backgroundColor: '#6366f1',
    borderColor: '#4f46e5',
  },
  toolButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  activeToolButtonText: {
    color: '#fff',
  },
  clearButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

