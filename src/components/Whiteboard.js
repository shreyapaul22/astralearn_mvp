import React, { useState, forwardRef, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, PanResponder, ScrollView, Dimensions } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const Whiteboard = forwardRef(({ paths, onPathsChange, onClear, mode = 'draw', onModeChange }, ref) => {
  const currentPathRef = useRef(null);
  const pathsRef = useRef(paths);
  const modeRef = useRef(mode);
  const scrollViewRef = useRef(null);
  const [, forceUpdate] = useState(0);
  const [scrollMode, setScrollMode] = useState(false);
  const [contentHeight, setContentHeight] = useState(SCREEN_HEIGHT * 4);
  
  pathsRef.current = paths;
  modeRef.current = mode;
  
  // Helper function to check if a point is near a path
  const isPointNearPath = (x, y, path, threshold = 15) => {
    try {
      const pathBounds = path.getBounds();
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

  // PanResponder for touch handling - captures single finger for draw/erase (disabled in scroll mode)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        if (scrollMode) return false;
        const touchCount = evt.nativeEvent.touches?.length || 0;
        return touchCount === 1;
      },
      onStartShouldSetPanResponderCapture: () => !scrollMode,
      onMoveShouldSetPanResponder: () => !scrollMode,
      onMoveShouldSetPanResponderCapture: () => !scrollMode,
      onPanResponderGrant: (evt) => {
        if (scrollMode) return;
        const { locationX, locationY } = evt.nativeEvent;
        const currentMode = modeRef.current;
        
        console.log(`🎨 Starting ${currentMode}`);
        
        if (currentMode === 'erase') {
          const remainingPaths = pathsRef.current.filter((p, index) => {
            const isNear = isPointNearPath(locationX, locationY, p.path);
            if (isNear) {
              console.log(`🗑️ Erasing path ${index}`);
            }
            return !isNear;
          });
          onPathsChange(remainingPaths);
        } else {
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
        if (scrollMode) return;
        
        const { locationX, locationY } = evt.nativeEvent;
        const currentMode = modeRef.current;
        
        if (currentMode === 'erase') {
          const remainingPaths = pathsRef.current.filter((p) => {
            return !isPointNearPath(locationX, locationY, p.path);
          });
          if (remainingPaths.length !== pathsRef.current.length) {
            onPathsChange(remainingPaths);
          }
        } else if (currentPathRef.current) {
          currentPathRef.current.path.lineTo(locationX, locationY);
          forceUpdate(prev => prev + 1);
        }
      },
      onPanResponderRelease: () => {
        if (scrollMode) return;
        if (currentPathRef.current) {
          onPathsChange([...pathsRef.current, currentPathRef.current]);
          currentPathRef.current = null;
          forceUpdate(prev => prev + 1);
        }
      },
      onPanResponderTerminate: () => {
        if (scrollMode) return;
        if (currentPathRef.current) {
          onPathsChange([...pathsRef.current, currentPathRef.current]);
          currentPathRef.current = null;
          forceUpdate(prev => prev + 1);
        }
      },
      onShouldBlockNativeResponder: () => !scrollMode,
      })
    ).current;

  return (
    <View style={styles.container}>
      <View 
        style={styles.canvasContainer} 
        ref={ref} 
        collapsable={false}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { height: contentHeight }]}
          showsVerticalScrollIndicator={scrollMode}
          scrollEnabled={scrollMode}
          nestedScrollEnabled={false}
          bounces={false}
          contentInsetAdjustmentBehavior="never"
          scrollEventThrottle={16}
          onScroll={(e) => {
            const y = e.nativeEvent.contentOffset.y;
            const viewH = e.nativeEvent.layoutMeasurement.height;
            const contentH = e.nativeEvent.contentSize.height;
            // auto-extend near bottom for unlimited scroll
            if (scrollMode && y + viewH > contentH - 80) {
              setContentHeight(prev => prev + SCREEN_HEIGHT * 2);
            }
          }}
        >
          <View 
            style={[styles.canvasWrapper, { minHeight: contentHeight }]} 
            collapsable={false}
            pointerEvents="box-only"
            {...(!scrollMode ? panResponder.panHandlers : {})}
          >
            <Canvas style={styles.canvas}>
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
        </ScrollView>
      </View>
      
      <View style={styles.toolbar}>
        <View style={styles.toolButtons}>
          <TouchableOpacity 
            style={[styles.toolButton, mode === 'draw' && !scrollMode && styles.activeToolButton]} 
            onPress={() => { setScrollMode(false); onModeChange?.('draw'); }}
          >
            <Text style={[styles.toolButtonText, mode === 'draw' && !scrollMode && styles.activeToolButtonText]}>
              ✏️ Draw
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.toolButton, mode === 'erase' && !scrollMode && styles.activeToolButton]} 
            onPress={() => { setScrollMode(false); onModeChange?.('erase'); }}
          >
            <Text style={[styles.toolButtonText, mode === 'erase' && !scrollMode && styles.activeToolButtonText]}>
              🧹 Erase
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.toolButton, scrollMode && styles.activeToolButton]} 
          onPress={() => setScrollMode(prev => !prev)}
        >
          <Text style={[styles.toolButtonText, scrollMode && styles.activeToolButtonText]}>
            {scrollMode ? '🧭 Scrolling' : '🧭 Scroll'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearButton} onPress={onClear}>
          <Text style={styles.clearButtonText}>🗑️ Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default Whiteboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    width: '100%',
  },
  canvasWrapper: {
    width: '100%',
    backgroundColor: '#ffffff',
  },
  canvas: {
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
