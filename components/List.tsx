import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { List as ListPaper, useTheme, IconButton } from 'react-native-paper';

const Details = ({ content }: { content: React.ReactNode }) => {
  return <View>{content}</View>;
};

export interface IList {
  id: string | number;
  title: string;
  content: React.ReactNode;
}

const List = ({ data }: { data: IList[] }) => {
  const [expandedId, setExpandedId] = React.useState<string | number>('');
  const theme = useTheme();

  const handleAccordionPress = (newExpandedId: string | number) => {
    setExpandedId(expandedId === newExpandedId ? '' : newExpandedId);
  };

  const CustomChevron = ({ isExpanded }: { isExpanded: boolean }) => (
    <IconButton
      icon={isExpanded ? 'chevron-up' : 'chevron-down'}
      iconColor={theme.colors.typography.secondary}
      size={24}
      style={{ height: 24, width: 24 }}
    />
  );

  return (
    <View>
      <ListPaper.AccordionGroup
        expandedId={expandedId.toString()}
        onAccordionPress={handleAccordionPress}
      >
        {data?.map(item => {
          const isOpened = expandedId === item.id.toString();
          return (
            <View
              key={item.id}
              style={[
                styles.accordionContainer,
                { backgroundColor: '#444', borderRadius: 5 },
                !isOpened && styles.accordionClosed,
              ]}
            >
              <ListPaper.Accordion
                title={item.title}
                id={item.id.toString()}
                titleStyle={{
                  color: theme.colors.typography.secondary,
                }}
                right={() => <CustomChevron isExpanded={isOpened} />}
              >
                <ListPaper.Item
                  title={null}
                  description={props => (
                    <Details content={item.content} {...props} />
                  )}
                />
              </ListPaper.Accordion>
            </View>
          );
        })}
      </ListPaper.AccordionGroup>
    </View>
  );
};

const styles = StyleSheet.create({
  accordionContainer: {
    marginBottom: 10,
  },
  accordionClosed: {
    minHeight: 40, // Adjust this value as needed
  },
});

export { List };
