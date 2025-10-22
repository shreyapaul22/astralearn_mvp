import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { APP_CONFIG } from '../../config';

export default function SelectionScreen({ navigation }) {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);

  const handleStart = () => {
    if (!selectedSubject || !selectedClass) {
      Alert.alert(
        'Incomplete Selection',
        'Please select both subject and class to continue.'
      );
      return;
    }

    // Navigate to Question screen with selections
    navigation.navigate('Question', {
      subject: selectedSubject,
      class: selectedClass,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Subject</Text>
        <View style={styles.optionsContainer}>
          {APP_CONFIG.subjects.map((subject) => {
            const isActive = APP_CONFIG.activeSubjects.includes(subject);
            const isSelected = selectedSubject === subject;
            
            return (
              <TouchableOpacity
                key={subject}
                style={[
                  styles.optionButton,
                  isSelected && styles.selectedOption,
                  !isActive && styles.disabledOption,
                ]}
                onPress={() => isActive && setSelectedSubject(subject)}
                disabled={!isActive}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.selectedOptionText,
                    !isActive && styles.disabledOptionText,
                  ]}
                >
                  {subject}
                </Text>
                {!isActive && (
                  <Text style={styles.comingSoonText}>Coming Soon</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Class</Text>
        <View style={styles.optionsContainer}>
          {APP_CONFIG.classes.map((classNum) => (
            <TouchableOpacity
              key={classNum}
              style={[
                styles.optionButton,
                selectedClass === classNum && styles.selectedOption,
              ]}
              onPress={() => setSelectedClass(classNum)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedClass === classNum && styles.selectedOptionText,
                ]}
              >
                Class {classNum}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.startButton,
          (!selectedSubject || !selectedClass) && styles.startButtonDisabled,
        ]}
        onPress={handleStart}
      >
        <Text style={styles.startButtonText}>Start Learning</Text>
      </TouchableOpacity>

      {selectedSubject && selectedClass && (
        <View style={styles.selectionSummary}>
          <Text style={styles.summaryText}>
            You selected: {selectedSubject} - Class {selectedClass}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedOption: {
    backgroundColor: '#6366f1',
    borderColor: '#4f46e5',
  },
  disabledOption: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    opacity: 0.6,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#fff',
  },
  disabledOptionText: {
    color: '#9ca3af',
  },
  comingSoonText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  startButton: {
    backgroundColor: '#10b981',
    padding: 18,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  startButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  selectionSummary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ede9fe',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  summaryText: {
    fontSize: 16,
    color: '#4c1d95',
    fontWeight: '500',
  },
});

