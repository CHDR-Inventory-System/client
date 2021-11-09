import '../style/app.scss';
import React, { useEffect, useState } from 'react';

type InventoryItem = {
  id: string;
  moveable: boolean;
  description: string;
  date: string;
  name: string;
  quantity: number;
};

const App = (): JSX.Element => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  const getAllItems = async () => {
    fetch('/csi/api/items/')
      .then(resp => resp.json())
      .then(data => setInventoryItems(data))
      .catch(error => {
        // eslint-disable-next-line no-console
        console.warn(error);
      });
  };

  useEffect(() => {
    getAllItems();
  }, []);

  return (
    <div className="app">
      <h1>Inventory</h1>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Movable</th>
            <th>Name</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {inventoryItems.map(item => (
            <tr key={item.id}>
              <td>{item.date}</td>
              <td>{item.description}</td>
              <td>{String(item.moveable)}</td>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
