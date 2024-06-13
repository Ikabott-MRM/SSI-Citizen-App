import * as React from 'react';
import { Text } from 'react-native';
import { List as ListPaper, useTheme } from 'react-native-paper';
import { View } from 'react-native';

const Details = ({ content }: { content: React.ReactNode }) => {
  const theme = useTheme();
  return (
    <Text style={{ color: theme.colors.secondary }} selectable>
      {content}
    </Text>
  );
};

interface IList {
  id: string;
  title: string;
  content: React.ReactNode;
}

const List = ({ data }: { data: IList[] }) => {
  return (
    <View>
      <ListPaper.AccordionGroup>
        {data?.map(item => (
          <View key={item.id} style={{ marginBottom: 10 }}>
            <ListPaper.Accordion title={item.title} id={item.id.toString()}>
              <ListPaper.Item
                title={null}
                description={props => (
                  <Details content={item.content} {...props} />
                )}
              />
            </ListPaper.Accordion>
          </View>
        ))}
      </ListPaper.AccordionGroup>
    </View>
  );
};

export { List };
