'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, UserSquare2, Phone, MapPin, Edit, Trash2, IndianRupee, Search, Filter, FileText } from 'lucide-react';
import { useMemo } from 'react';
import { useUI } from '@/context/UIContext';
import driverService, { Driver } from '@/services/driverService';
import Button from '@/components/ui/Button/Button';
import Spinner from '@/components/ui/Spinner/Spinner';
import DriverForm from '@/components/drivers/DriverForm';
import PayrollDrawer from '@/components/drivers/PayrollDrawer';
import styles from './page.module.css';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { openDrawer, closeDrawer, showToast } = useUI();

  const fetchDrivers = useCallback(async () => {
    try {
      const { data } = await driverService.getAll();
      setDrivers(data.data);
    } catch {
      showToast('Failed to load drivers', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const filteredDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      const matchesSearch = 
        driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.driverId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && driver.isActive) || 
        (statusFilter === 'inactive' && !driver.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [drivers, searchQuery, statusFilter]);

  const handleCreate = () => {
    openDrawer(
      <DriverForm 
        onSuccess={() => {
          closeDrawer();
          fetchDrivers();
          showToast('Driver added successfully', 'success');
        }} 
      />
    );
  };

  const handlePayroll = (driver: Driver) => {
    openDrawer(<PayrollDrawer driver={driver} onSuccess={closeDrawer} />);
  };

  const handleEdit = (driver: Driver) => {
    openDrawer(
      <DriverForm 
        initialData={driver}
        onSuccess={() => {
          closeDrawer();
          fetchDrivers();
          showToast('Driver updated successfully', 'success');
        }} 
      />
    );
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this driver?')) {
      try {
        await driverService.delete(id);
        fetchDrivers();
        showToast('Driver deleted', 'success');
      } catch {
        showToast('Failed to delete driver', 'error');
      }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className="text-gradient">Driver Registry</h1>
          <p className={styles.subtitle}>{filteredDrivers.length} {filteredDrivers.length === 1 ? 'member' : 'members'} found</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size={18} />
          Register Driver
        </Button>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.searchSection}>
          <div className={styles.searchWrap}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by name, phone or ID..." 
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
              <option value="all">All Drivers</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive</option>
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
          {filteredDrivers.map((driver) => (
            <div key={driver._id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.avatarWrap}>
                  {driver.photo ? (
                    <img src={driver.photo} alt={driver.name} className={styles.avatar} />
                  ) : (
                    <div className={styles.placeholderAvatar}>
                      <UserSquare2 size={24} />
                    </div>
                  )}
                  <div className={[styles.statusDot, driver.isActive ? styles.active : ''].join(' ')} />
                </div>
                <div className={styles.cardActions}>
                  <button onClick={() => handlePayroll(driver)} className={styles.actionBtn} title="Generate Payslip">
                    <FileText size={14} />
                  </button>
                  <button onClick={() => handleEdit(driver)} className={styles.actionBtn}>
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDelete(driver._id)} className={styles.actionBtnDelete}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className={styles.driverInfo}>
                <h3 className={styles.name}>{driver.name}</h3>
                <span className={styles.idBadge}>{driver.driverId}</span>
              </div>

              <div className={styles.contactList}>
                <div className={styles.contactItem}>
                  <Phone size={14} />
                  <span>{driver.phone}</span>
                </div>
                <div className={styles.contactItem}>
                  <MapPin size={14} />
                  <span className={styles.truncate}>{driver.address}</span>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.salaryInfo}>
                  <IndianRupee size={14} />
                  <span>{driver.salary.toLocaleString()}/mo</span>
                </div>
                <div className={styles.busInfo}>
                  {driver.assignedBusId ? 'On Duty' : 'Available'}
                </div>
              </div>
            </div>
          ))}

          {filteredDrivers.length === 0 && (
            <div className={styles.empty}>
              <UserSquare2 size={48} className={styles.emptyIcon} />
              <h3>{searchQuery || statusFilter !== 'all' ? 'No matches found' : 'No drivers registered'}</h3>
              <p>
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or status filter to find team members.' 
                  : 'Add your first driver to start assigning routes.'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button variant="secondary" onClick={handleCreate}>Add Driver</Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
