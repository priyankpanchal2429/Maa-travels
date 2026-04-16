'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, MapPin, Edit, Trash2, Map as MapIcon, Search } from 'lucide-react';
import { useMemo } from 'react';
import { useUI } from '@/context/UIContext';
import routeService, { Route } from '@/services/routeService';
import Button from '@/components/ui/Button/Button';
import Spinner from '@/components/ui/Spinner/Spinner';
import RouteForm from '@/components/routes/RouteForm';
import styles from './page.module.css';

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { openDrawer, closeDrawer, showToast } = useUI();

  const fetchRoutes = useCallback(async () => {
    try {
      const { data } = await routeService.getAll();
      setRoutes(data.data);
    } catch {
      showToast('Failed to load routes', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => 
      route.routeName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [routes, searchQuery]);

  const handleCreate = () => {
    openDrawer(
      <RouteForm 
        onSuccess={() => {
          closeDrawer();
          fetchRoutes();
          showToast('Route created successfully', 'success');
        }} 
      />
    );
  };

  const handleEdit = (route: Route) => {
    openDrawer(
      <RouteForm 
        initialData={route}
        onSuccess={() => {
          closeDrawer();
          fetchRoutes();
          showToast('Route updated successfully', 'success');
        }} 
      />
    );
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this route?')) {
      try {
        await routeService.delete(id);
        fetchRoutes();
        showToast('Route deleted', 'success');
      } catch {
        showToast('Failed to delete route', 'error');
      }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="text-gradient">Route Management</h1>
          <p className={styles.subtitle}>{filteredRoutes.length} {filteredRoutes.length === 1 ? 'path' : 'paths'} mapped</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size={18} />
          Add New Route
        </Button>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.searchSection}>
          <div className={styles.searchWrap}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by route name..." 
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loader}>
          <Spinner size="lg" />
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredRoutes.map((route) => (
            <div key={route._id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.iconBox}>
                  <MapIcon size={22} className={styles.primaryIcon} />
                </div>
                <div className={styles.cardActions}>
                  <button onClick={() => handleEdit(route)} className={styles.actionBtn}>
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(route._id)} className={styles.actionBtnDelete}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className={styles.routeName}>{route.routeName}</h3>
              
              <div className={styles.stopsInfo}>
                <p className={styles.stopsLabel}>{route.stops.length} Total Stops</p>
                <div className={styles.stopsList}>
                  {route.stops.slice(0, 3).map((stop, i) => (
                    <div key={i} className={styles.stopItem}>
                      <MapPin size={12} className={styles.pinIcon} />
                      <span>{stop.name}</span>
                    </div>
                  ))}
                  {route.stops.length > 3 && (
                    <p className={styles.moreStops}>+ {route.stops.length - 3} more stops</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredRoutes.length === 0 && (
            <div className={styles.empty}>
              <MapIcon size={48} className={styles.emptyIcon} />
              <h3>{searchQuery ? 'No matches found' : 'No routes found'}</h3>
              <p>
                {searchQuery 
                  ? 'Try adjusting your search to find the correct transit path.' 
                  : 'Start by creating your first bus route.'}
              </p>
              {!searchQuery && (
                <Button variant="secondary" onClick={handleCreate}>Create Route</Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
