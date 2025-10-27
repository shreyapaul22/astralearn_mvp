import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import Whiteboard from '../components/Whiteboard';
import { generateQuestion, verifyAnswer, generateHint } from '../services/geminiService';
import { canvasToBase64 } from '../utils/canvasToImage';

export default function QuestionScreen({ route, navigation }) {
  const { subject, class: classNum } = route.params;
  
  const whiteboardRef = useRef(null);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [paths, setPaths] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [hint, setHint] = useState('');
  const [whiteboardMode, setWhiteboardMode] = useState('draw');

  // Load question on mount
  useEffect(() => {
    loadQuestion();
  }, []);

  const loadQuestion = async () => {
    setLoading(true);
    try {
      const generatedQuestion = await generateQuestion(subject, classNum);
      setQuestion(generatedQuestion);
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Failed to load question',
        [
          { text: 'Retry', onPress: loadQuestion },
          { text: 'Go Back', onPress: () => navigation.goBack() },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPaths([]);
  };

  const handleSubmit = async () => {
    if (paths.length === 0) {
      Alert.alert(
        'No Solution',
        'Please draw your solution on the whiteboard before submitting.'
      );
      return;
    }

    setVerifying(true);
    try {
      // Convert canvas to image
      console.log('Starting canvas capture...');
      const base64Image = await captureCanvas();
      console.log('Canvas captured, image length:', base64Image?.length);
      
      if (!base64Image || base64Image.length < 100) {
        throw new Error('Failed to capture canvas properly - image too small');
      }
      
      // Verify with AI
      console.log('Sending to AI for verification...');
      const verificationResult = await verifyAnswer(question, base64Image);
      console.log('AI response received:', verificationResult);
      
      setResult(verificationResult);
      setShowResult(true);
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to verify answer. Please try again.'
      );
    } finally {
      setVerifying(false);
    }
  };

  const captureCanvas = async () => {
    if (!whiteboardRef.current) {
      console.error('Whiteboard ref is null');
      throw new Error('Canvas reference not available');
    }
    
    console.log('Capturing canvas view...');
    const base64 = await canvasToBase64(whiteboardRef);
    console.log('Canvas capture complete');
    return base64;
  };

  const handleNextQuestion = () => {
    setShowResult(false);
    setResult(null);
    setPaths([]);
    setShowHint(false);
    setHint('');
    loadQuestion();
  };

  const handleTryAgain = () => {
    setShowResult(false);
    setResult(null);
    setPaths([]);
  };

  const handleShowHint = async () => {
    setHintLoading(true);
    try {
      // Capture canvas if there's any content
      let canvasImage = null;
      if (paths.length > 0 && whiteboardRef.current) {
        try {
          canvasImage = await captureCanvas();
        } catch (error) {
          console.log('Could not capture canvas, will provide general hint');
        }
      }
      
      const generatedHint = await generateHint(question, canvasImage);
      setHint(generatedHint);
      setShowHint(true);
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Failed to get hint. Please try again.'
      );
    } finally {
      setHintLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Generating question...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Question Card - Scrollable */}
      <ScrollView 
        style={styles.questionScrollView}
        contentContainerStyle={styles.questionScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionCard}>
          <Text style={styles.questionLabel}>Question:</Text>
          <Text style={styles.questionText}>{question}</Text>
          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>{subject}</Text>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.metaText}>Class {classNum}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Whiteboard - NOT inside ScrollView */}
      <View 
        style={styles.whiteboardContainer}
        onStartShouldSetResponder={() => false} // Don't intercept touches
        pointerEvents="box-none" // Pass touches to children
      >
        <Whiteboard
          ref={whiteboardRef}
          paths={paths}
          onPathsChange={setPaths}
          onClear={handleClear}
          mode={whiteboardMode}
          onModeChange={setWhiteboardMode}
        />
      </View>

      {/* Action Buttons - Fixed at bottom */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.hintButton]}
          onPress={handleShowHint}
          disabled={hintLoading}
        >
          {hintLoading ? (
            <View style={styles.hintLoadingContainer}>
              <ActivityIndicator color="#6366f1" size="small" />
              <Text style={styles.hintLoadingText}>Analyzing...</Text>
            </View>
          ) : (
            <Text style={styles.hintButtonText}>💡 Get Hint</Text>
          )}
        </TouchableOpacity>

        <View style={styles.primaryButtons}>
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={verifying || paths.length === 0}
          >
            {verifying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Submit Answer</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.newQuestionButton]}
            onPress={handleNextQuestion}
          >
            <Text style={[styles.buttonText, styles.newQuestionButtonText]}>
              New Question
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Result Modal */}
      <Modal
        visible={showResult}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowResult(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[
              styles.resultHeader,
              result?.isCorrect ? styles.correctHeader : styles.incorrectHeader
            ]}>
              <Text style={styles.resultHeaderText}>
                {result?.isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
              </Text>
            </View>

            <ScrollView style={styles.feedbackContainer}>
              <Text style={styles.feedbackTitle}>Feedback:</Text>
              <Text style={styles.feedbackText}>{result?.feedback}</Text>

              {result?.correctAnswer && (
                <View style={styles.correctAnswerContainer}>
                  <Text style={styles.correctAnswerTitle}>Correct Answer:</Text>
                  <Text style={styles.correctAnswerText}>{result.correctAnswer}</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              {!result?.isCorrect && (
                <TouchableOpacity
                  style={[styles.button, styles.tryAgainButton]}
                  onPress={handleTryAgain}
                >
                  <Text style={styles.buttonText}>Try Again</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.button, styles.nextButton]}
                onPress={handleNextQuestion}
              >
                <Text style={styles.buttonText}>Next Question</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Hint Modal */}
      <Modal
        visible={showHint}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHint(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.hintHeader}>
              <Text style={styles.hintHeaderText}>💡 Hint</Text>
            </View>

            <ScrollView style={styles.feedbackContainer}>
              <Text style={styles.feedbackText}>{hint}</Text>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.nextButton]}
                onPress={() => setShowHint(false)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  questionScrollView: {
    maxHeight: 150,
    flexGrow: 0,
  },
  questionScrollContent: {
    padding: 15,
    paddingBottom: 10,
  },
  questionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 18,
    color: '#1f2937',
    lineHeight: 26,
  },
  metaInfo: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
  },
  whiteboardContainer: {
    flex: 1,
    marginHorizontal: 15,
    marginBottom: 10,
    overflow: 'hidden',
  },
  actionButtons: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    gap: 10,
    backgroundColor: '#f5f5f5',
  },
  hintButton: {
    backgroundColor: '#fef3c7',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  hintButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
  },
  hintLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hintLoadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  primaryButtons: {
    gap: 10,
  },
  button: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#10b981',
  },
  newQuestionButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  newQuestionButtonText: {
    color: '#6366f1',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  resultHeader: {
    padding: 20,
    alignItems: 'center',
  },
  correctHeader: {
    backgroundColor: '#d1fae5',
  },
  incorrectHeader: {
    backgroundColor: '#fee2e2',
  },
  resultHeaderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  feedbackContainer: {
    padding: 20,
    maxHeight: 300,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  feedbackText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  correctAnswerContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  correctAnswerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  correctAnswerText: {
    fontSize: 16,
    color: '#78350f',
  },
  modalButtons: {
    padding: 20,
    gap: 10,
  },
  tryAgainButton: {
    backgroundColor: '#f59e0b',
  },
  nextButton: {
    backgroundColor: '#6366f1',
  },
  hintHeader: {
    padding: 20,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
  },
  hintHeaderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#92400e',
  },
});

