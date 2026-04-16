'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Bus as BusIcon, Edit, Trash2, Power, Wrench, AlertCircle, Search, Filter } from 'lucide-react';
import { useMemo } from 'react';
import { useUI } from '@/context/UIContext';
import busService, { Bus, BusStatus } from '@/services/busService';
import Button from '@/components/ui/Button/Button';
import Spinner from '@/components/ui/Spinner/Spinner';
import BusForm from '@/components/buses/BusForm';
import styles from './page.module.css';

const statusConfig = {
  idle: { label: 'Idle', color: '#64748b', icon: <Power size={14} /> },
  running: { label: 'Running', color: '#10b981', icon: <Power size={14} className={styles.spin} /> },
  maintenance: { label: 'Maintenance', color: '#f59e0b', icon: <Wrench size={14} /> },
};

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { openDrawer, closeDrawer, showToast } = useUI();

  const fetchBuses = useCallback(async () => {
    try {
      const { data } = await busService.getAll();
      setBuses(data.data);
    } catch {
      showToast('Failed to load buses', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  const filteredBuses = useMemo(() => {
    return buses.filter((bus) => {
      const matchesSearch = 
        bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bus.plateNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || bus.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [buses, searchQuery, statusFilter]);

  const handleCreate = () => {
    openDrawer(
      <BusForm 
        onSuccess={() => {
          closeDrawer();
          fetchBuses();
          showToast('Bus added successfully', 'success');
        }} 
      />
    );
  };

  const handleEdit = (bus: Bus) => {
    openDrawer(
      <BusForm 
        initialData={bus}
        onSuccess={() => {
          closeDrawer();
          fetchBuses();
          showToast('Bus updated successfully', 'success');
        }} 
      />
    );
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this bus?')) {
      try {
        await busService.delete(id);
        fetchBuses();
        showToast('Bus deleted', 'success');
      } catch {
        showToast('Failed to delete bus', 'error');
      }
    }
  };

  const toggleStatus = async (bus: Bus) => {
    const nextStatus: { [key in BusStatus]: BusStatus } = {
      idle: 'running',
      running: 'maintenance',
      maintenance: 'idle'
    };
    
    try {
      await busService.update(bus._id, { status: nextStatus[bus.status] });
      fetchBuses();
      showToast(`Status updated to ${nextStatus[bus.status]}`, 'info');
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="text-gradient">Bus Management</h1>
          <p className={styles.subtitle}>{filteredBuses.length} {filteredBuses.length === 1 ? 'vehicle' : 'vehicles'} tracked</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size={18} />
          Add New Bus
        </Button>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.searchSection}>
          <div className={styles.searchWrap}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by bus number or plate..." 
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.filterSection}>
          <div className={styles.filterWrap}>
            <Filter size={16} className={styles.filterIcon} />
            <span className={styles.filterLabel}>Status</span>
            <select 
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Any Status</option>
              <option value="running">Running</option>
              <option value="idle">Idle</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loader}>
          <Spinner size="lg" />
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredBuses.map((bus) => (
            <div key={bus._id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.iconBox}>
                  <BusIcon size={24} />
                </div>
                <div className={styles.cardActions}>
                  <button onClick={() => handleEdit(bus)} className={styles.actionBtn}>
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(bus._id)} className={styles.actionBtnDelete}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className={styles.busInfo}>
                <h3 className={styles.busNumber}>{bus.busNumber}</h3>
                <p className={styles.plateNumber}>{bus.plateNumber}</p>
              </div>

              <div className={styles.detailsRow}>
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>Capacity</span>
                  <span className={styles.detailValue}>{bus.capacity} Seats</span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>Driver</span>
                  <span className={styles.detailValue}>
                    {bus.currentDriverId ? 'Assigned' : <span className={styles.unassigned}>Unassigned</span>}
                  </span>
                </div>
              </div>

              <div className={styles.statusSection}>
                <div 
                  className={styles.statusBadge} 
                  style={{ '--status-color': statusConfig[bus.status].color } as any}
                  onClick={() => toggleStatus(bus)}
                  title="Click to toggle status"
                >
                  {statusConfig[bus.status].icon}
                  <span>{statusConfig[bus.status].label}</span>
                </div>
                <p className={styles.statusHint}>Click to change status</p>
              </div>
            </div>
          ))}

          {filteredBuses.length === 0 && (
            <div className={styles.empty}>
              <BusIcon size={48} className={styles.emptyIcon} />
              <h3>{searchQuery || statusFilter !== 'all' ? 'No matches found' : 'No buses registered'}</h3>
              <p>
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or deployment status to find vehicles.'
                  : 'Add your first vehicle to the bus network.'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button variant="secondary" onClick={handleCreate}>Add Bus</Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
