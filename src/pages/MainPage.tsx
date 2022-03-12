import '../scss/main-page.scss';
import React, { useEffect, useState } from 'react';
import { Input, notification } from 'antd';
import debounce from 'lodash/debounce';
import { AiOutlineSearch } from 'react-icons/ai';
import { FaBoxOpen } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { Item } from '../types/API';
import ItemCard from '../components/ItemCard';
import useInventory from '../hooks/inventory';
import useLoader from '../hooks/loading';
import NoContent from '../components/dashboard/NoContent';
import LoadingSpinner from '../components/LoadingSpinner';

const MainPage = (): JSX.Element | null => {
  const inventory = useInventory();
  const loader = useLoader(true);
  // Store items an a cache so that we don't have to re-query the API
  // every time the search query changes
  const [inventoryCache, setInventoryCache] = useState<Item[]>([]);

  const handleSearch = debounce((query: string) => {
    if (!query) {
      inventory.setItems(inventoryCache);
      return;
    }

    const items = [...inventoryCache].filter(item =>
      item.name.toLowerCase().trim().includes(query.toLowerCase().trim())
    );

    inventory.setItems(items);
  }, 500);

  const loadInventory = async () => {
    loader.startLoading();

    try {
      const items = await inventory.init({ hideRetired: true });
      setInventoryCache(items);
    } catch {
      notification.error({
        message: "Couldn't Load Items",
        key: 'main-page-inventory-load-error',
        description: `
          An unexpected error occurred loading inventory.
          Refresh the page to try again.
        `
      });
    }

    // Using delay here to prevent the layout shift that occurs when
    // the loading spinner dismounts and the cards render
    loader.stopLoading({ delay: 250 });
  };

  const renderInventory = () => {
    if (loader.isLoading) {
      return null;
    }

    return inventory.items.length === 0 ? (
      <NoContent
        icon={<FaBoxOpen size={120} />}
        text="No items available"
        className="empty-inventory-list"
      />
    ) : (
      inventory.items.map(item => <ItemCard item={item} key={item.ID} />)
    );
  };

  useEffect(() => {
    loadInventory();

    document.title = 'CHDR Inventory';

    return () => {
      notification.destroy();
    };
  }, []);

  return (
    <div className="main-page">
      <Navbar sticky />
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
        {loader.isLoading && <LoadingSpinner text="Loading..." />}
        {renderInventory()}
      </div>
    </div>
  );
};

export default MainPage;
