import '../scss/main-page.scss';
import React, { useMemo, useEffect, useState } from 'react';
import { Input, notification } from 'antd';
import debounce from 'lodash/debounce';
import { useNavigate } from 'react-router-dom';
import { AiOutlineSearch } from 'react-icons/ai';
import { FaBoxOpen } from 'react-icons/fa';
import Cookies from 'js-cookie';
import Navbar from '../components/Navbar';
import { Item, User } from '../types/API';
import mockInventory from '../assets/mocks/inventory.json';
import ItemCard from '../components/ItemCard';
import useInventory from '../hooks/inventory';
import useLoader from '../hooks/loading';
import EmptyTableContent from '../components/dashboard/EmptyTableContent';

const MainPage = (): JSX.Element | null => {
  const navigate = useNavigate();
  const inventory = useInventory();
  const loader = useLoader();

  // Store items an a cache so that we don't have to re-query the API
  // every time the search query changes
  const [inventoryCache, setInventoryCache] = useState<Item[]>([]);

  // Because we won't have access to the updated user state after
  // a call to dispatch, we can't rely on it's value. Therefore, we'll
  // have to read from local storage
  const user = useMemo(() => {
    try {
      return JSON.parse(Cookies.get('user') || '') as User;
    } catch (err) {
      return null;
    }
  }, []);

  const handleSearch = debounce((query: string) => {
    if (!query) {
      inventory.setItems(inventoryCache);
      return;
    }

    const items = [...inventoryCache].filter(
      item => item.name.toLowerCase().trim().includes(query.toLowerCase().trim())
      // eslint-disable-next-line function-paren-newline
    );

    inventory.setItems(items);
  }, 500);

  const loadInventory = async () => {
    loader.startLoading();

    try {
      inventory.setItems(mockInventory);
      setInventoryCache(mockInventory);
    } catch {
      notification.error({
        duration: 0,
        message: "Couldn't Load Items",
        key: 'inventory-load-error',
        description: `
          An unexpected error occurred loading inventory.
          Refresh the page to try again.
        `
      });
    }

    loader.stopLoading();
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else {
      loadInventory();
    }
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="main-page">
      <Navbar />
      <div className="search-input-wrapper">
        <h2>Search</h2>
        <Input
          placeholder="Search for an item..."
          type="search"
          className="search-input"
          onChange={event => handleSearch(event.target.value)}
          prefix={<AiOutlineSearch size={20} color="#A3A3A3" />}
        />
      </div>
      <div className="items">
        {inventory.items.length === 0 ? (
          <EmptyTableContent icon={<FaBoxOpen size={120} />} text="No items available" />
        ) : (
          inventory.items.map(item => <ItemCard item={item} key={item.ID} />)
        )}
      </div>
    </div>
  );
};

export default MainPage;
