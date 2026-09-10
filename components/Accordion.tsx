import 'react-native-get-random-values';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextStyle } from 'react-native';

type Styles = {
  accordionContainer: object;
  accordionTitle: TextStyle;
};

export const Accordion = ({
  styles,
  title,
  children,
  isOpen = false,
}: {
  styles: Styles;
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(isOpen);

  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={[styles.accordionContainer, { backgroundColor: '#F5F7F7' }]}>
      <TouchableOpacity onPress={toggleAccordion}>
        <Text style={styles.accordionTitle}>{title}</Text>
      </TouchableOpacity>
      {isExpanded && <View>{children}</View>}
    </View>
  );
};
