import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Combobox from '../';
import MenuItem from '../../MenuItem';
import Button from '../../Button';
import Input from '../../Input';
import { action } from '@storybook/addon-actions';
import Gapped from '../../Gapped';

interface Item {
  value: number;
  label: string;
}

const SIMPLE_ITEMS = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'];

const ITEMS: Array<React.ReactElement<any> | Item> = [
  <MenuItem.Static key="static1">
    <Input width="100%" />
  </MenuItem.Static>,
  { value: 1, label: 'First' },
  { value: 2, label: 'Second' },
  <MenuItem.Header key="23">Header</MenuItem.Header>,
  { value: 3, label: 'Third' },
  { value: 4, label: 'Fourth' },
  <MenuItem.Separator key="static2" />,
  <MenuItem.Static key="static3">
    <Button key="static4">Button is here!</Button>
  </MenuItem.Static>,
  <MenuItem.Separator key="static5" />,
  { value: 5, label: 'Fifth' },
  { value: 6, label: 'Sixth' },
  <MenuItem
    key="static6"
    // tslint:disable-next-line:jsx-no-lambda
    onClick={e => {
      e.preventDefault();
      action('prevented default click')();
    }}
  >
    Button
  </MenuItem>
];

const delay = <T extends {}>(time: number) => (data: T): Promise<T> =>
  new Promise(resolve => setTimeout(resolve, time, data));

const maybeResolve = <T extends {}>(chance: number) => (data: T) =>
  Math.random() > chance ? Promise.reject() : Promise.resolve(data);

const getSimpleItems = (query: string) => {
  const items = SIMPLE_ITEMS.filter(item => {
    return item.toLowerCase().indexOf(query.toLowerCase()) > -1;
  });

  return Promise.resolve(items);
};

const getAnyItems = (query: string) => {
  const items = ITEMS.filter(item => {
    return (
      React.isValidElement(item) ||
      (item as Item).label.toLowerCase().indexOf(query.toLowerCase()) > -1 ||
      (item as Item).value.toString().indexOf(query.toLowerCase()) > -1
    );
  });

  return Promise.resolve(items)
    .then(delay<typeof items>(500))
    .then(maybeResolve(0.6));
};

storiesOf('Combobox', module)
  .addDecorator(story => (
    <div
      style={{
        padding: '20px 120px 150px',
        border: '1px solid #dfdede',
        overflow: 'hidden'
      }}
    >
      {story()}
    </div>
  ))
  .add('Simple example', () => {
    const renderItem = (item: string) => item;
    const renderValue = (value: string | null) => value || '';

    return (
      <Combobox
        getItems={getSimpleItems}
        onChangeValue={action('changed simple value')}
        renderItem={renderItem}
        renderValue={renderValue}
      />
    );
  })
  .add('With any elements', () => (
    <Gapped>
      <Combobox onChangeValue={action('changed value')} getItems={getAnyItems} />
    </Gapped>
  ));