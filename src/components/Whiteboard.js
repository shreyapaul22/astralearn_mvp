import React, { useState, forwardRef, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform, PanResponder } from 'react-native';
import Canvas from 'react-native-canvas';

const Whiteboard = forwardRef(({ paths, onPathsChange, onClear }, ref) => {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const currentPathPointsRef = useRef([]); // Store all points in current stroke
  const [containerSize, setContainerSize] = useState({ width: 400, height: 300 });
  const isInitializedRef = useRef(false);

  // Log component rendering
  console.log(`🎨 Canvas Whiteboard rendered on ${Platform.OS}`);
  console.log(`🎨 Current paths count: ${paths ? paths.length : 0}`);

  // Update canvas size when container size changes
  useEffect(() => {
    if (canvasRef.current && containerSize.width > 0 && containerSize.height > 0) {
      console.log(`📏 Updating canvas size to: ${containerSize.width} x ${containerSize.height}`);
      canvasRef.current.width = containerSize.width;
      canvasRef.current.height = containerSize.height;
      
      // Reapply drawing style after resize
      const ctx = canvasRef.current.getContext('2d');
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Redraw all saved paths after canvas resize
      if (paths && paths.length > 0) {
        console.log(`🎨 Redrawing ${paths.length} saved paths`);
        paths.forEach((pathData) => {
          if (pathData.points && pathData.points.length > 0) {
            // Draw path with all points
            ctx.beginPath();
            ctx.moveTo(pathData.points[0].x, pathData.points[0].y);
            for (let i = 1; i < pathData.points.length; i++) {
              ctx.lineTo(pathData.points[i].x, pathData.points[i].y);
            }
            ctx.stroke();
          }
        });
      }
    }
  }, [containerSize, paths]);

  // Initialize canvas
  const handleCanvas = (canvas) => {
    if (canvas) {
      canvasRef.current = canvas;
      
      // Always update canvas size to match container
      if (containerSize.width > 0 && containerSize.height > 0) {
        canvas.width = containerSize.width;
        canvas.height = containerSize.height;
        
        // Set drawing style
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        if (!isInitializedRef.current) {
          isInitializedRef.current = true;
          console.log('🎨 Canvas initialized!');
          console.log(`📏 Canvas size: ${canvas.width} x ${canvas.height}`);
        }
      }
    }
  };

  // Touch handlers
  const handleTouchStart = (event) => {
    console.log('✅ Canvas Touch START:', Platform.OS);
    console.log('🎯 Touch coordinates:', event.nativeEvent.locationX, event.nativeEvent.locationY);
    
    isDrawingRef.current = true;
    const point = {
      x: event.nativeEvent.locationX,
      y: event.nativeEvent.locationY
    };
    lastPointRef.current = point;
    currentPathPointsRef.current = [point]; // Start new path with first point
  };

  const handleTouchMove = (event) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    
    console.log('✅ Canvas Touch MOVE:', Platform.OS);
    console.log('🎯 Move coordinates:', event.nativeEvent.locationX, event.nativeEvent.locationY);
    
    const ctx = canvasRef.current.getContext('2d');
    const currentPoint = {
      x: event.nativeEvent.locationX,
      y: event.nativeEvent.locationY
    };
    
    // Add point to current path
    currentPathPointsRef.current.push(currentPoint);
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();
    
    lastPointRef.current = currentPoint;
  };

  const handleTouchEnd = (event) => {
    console.log('✅ Canvas Touch END:', Platform.OS);
    
    if (isDrawingRef.current && canvasRef.current) {
      // Add final point if needed
      const finalPoint = {
        x: event.nativeEvent.locationX,
        y: event.nativeEvent.locationY
      };
      
      if (currentPathPointsRef.current.length === 0 || 
          (currentPathPointsRef.current[currentPathPointsRef.current.length - 1].x !== finalPoint.x ||
           currentPathPointsRef.current[currentPathPointsRef.current.length - 1].y !== finalPoint.y)) {
        currentPathPointsRef.current.push(finalPoint);
      }
      
      // Save the path with all points
      const pathData = {
        points: [...currentPathPointsRef.current],
        timestamp: new Date().toISOString()
      };
      
      console.log(`💾 Saving Canvas path with ${pathData.points.length} points`);
      onPathsChange([...(paths || []), pathData]);
      
      // Reset current path
      currentPathPointsRef.current = [];
    }
    
    isDrawingRef.current = false;
  };

  return (
    <View style={styles.container}>
      <View 
        style={styles.canvasContainer} 
        ref={ref} 
        collapsable={false}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          console.log('📐 Canvas container size:', width, 'x', height);
          setContainerSize({ width, height });
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Canvas 
          ref={handleCanvas}
          style={styles.canvas}
        />
      </View>
      
      <View style={styles.toolbar}>
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={() => {
            console.log(`🧹 Clear button pressed - ${Platform.OS}`);
            // Clear the canvas
            if (canvasRef.current) {
              const ctx = canvasRef.current.getContext('2d');
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              console.log('🧹 Canvas cleared!');
            }
            onClear && onClear();
          }}
        >
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
    flex: 5, // Increased from 1 to give more space to canvas
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    marginBottom: 5, // Reduced from 10 to maximize canvas height
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
    paddingVertical: 8, // Reduced from 10 to give more space to canvas
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

