'use client';

import { useState, useRef, useEffect, KeyboardEvent, FormEvent, ClipboardEvent, ChangeEvent } from 'react';
import { 
  X, 
  Loader2, 
  RotateCcw, 
  Tag, 
  BarChart3, 
  AlertTriangle, 
  Users, 
  Trash2,
  Package,
  Upload,
  FileText,
  Coins
} from 'lucide-react';
import styles from './page.module.css';

// CSV Parser interface
interface CSVRow {
  Displayname: string;
  NameColor: string;
  Wins: number;
  Points: number;
  SeasonPoints: number;
  Eliminations: number;
  TotalRaces: number;
}

// Currency interface
interface CurrencyEntry {
  type: 'TC' | 'CC' | 'MM';
  amount: string;
}

// Mock API function to simulate fetching item IDs
const fetchItemIDs = async (): Promise<string[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock data
  return [
    'ITEM-1001',
    'ITEM-1002', 
    'ITEM-1003',
    'ITEM-2001',
    'ITEM-2002',
    'ITEM-3001',
    'ITEM-4001',
    'ITEM-5001',
    'ITEM-6001',
    'ITEM-7001',
  ];
};

// CSV parsing function
const parseCSV = (csvText: string): CSVRow[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const rows: CSVRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length === headers.length) {
      const row: Partial<CSVRow> = {};
      headers.forEach((header, index) => {
        const value = values[index];
        // Convert numeric fields
        if (['Wins', 'Points', 'SeasonPoints', 'Eliminations', 'TotalRaces'].includes(header)) {
          (row as Record<string, unknown>)[header] = parseFloat(value) || 0;
        } else {
          (row as Record<string, unknown>)[header] = value;
        }
      });
      rows.push(row as CSVRow);
    }
  }
  
  return rows;
};

export default function Home() {
  const [itemInput, setItemInput] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [names, setNames] = useState<string[]>(['']);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [availableItems, setAvailableItems] = useState<string[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [isProcessingCSV, setIsProcessingCSV] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [topNamesCount, setTopNamesCount] = useState<number>(50);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currencies, setCurrencies] = useState<CurrencyEntry>({ type: 'TC', amount: '' });
  const nameRefs = useRef<(HTMLInputElement | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemInputRef = useRef<HTMLInputElement>(null);

  // Section enable/disable state
  const [isItemSectionEnabled, setIsItemSectionEnabled] = useState(false);
  const [isCurrencySectionEnabled, setIsCurrencySectionEnabled] = useState(false);

  // Load items on component mount
  useEffect(() => {
    const loadItems = async () => {
      try {
        setIsLoadingItems(true);
        setItemsError(null);
        const items = await fetchItemIDs();
        setAvailableItems(items);
      } catch (error) {
        setItemsError(error instanceof Error ? error.message : 'Failed to load items');
        console.error('Failed to fetch items:', error);
      } finally {
        setIsLoadingItems(false);
      }
    };

    loadItems();
  }, []);

  const filteredItemIDs = itemInput
    ? availableItems.filter(id =>
        id.toLowerCase().includes(itemInput.toLowerCase()) &&
        !selectedItems.includes(id)
      )
    : availableItems.filter(id => !selectedItems.includes(id));

  // Calculate name statistics
  const enteredNames = names.filter(name => name.trim().length > 0);
  const nameCount = enteredNames.length;
  
  // Check for duplicates
  const nameCounts = enteredNames.reduce((acc, name) => {
    const trimmedName = name.trim().toLowerCase();
    acc[trimmedName] = (acc[trimmedName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const duplicateNames = Object.entries(nameCounts)
    .filter(([, count]) => count > 1)
    .map(([name, count]) => ({ name, count }));
  
  const hasDuplicates = duplicateNames.length > 0;

  // Check if a specific name at index is a duplicate
  const isNameDuplicate = (name: string): boolean => {
    const trimmedName = name.trim().toLowerCase();
    if (trimmedName.length === 0) return false;
    
    // Count how many times this name appears in the list
    const occurrences = names.filter((n) => 
      n.trim().toLowerCase() === trimmedName && n.trim().length > 0
    ).length;
    
    return occurrences > 1;
  };

  const handleCSVUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setCsvError('Please select a CSV file');
      return;
    }

    setIsProcessingCSV(true);

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      if (rows.length === 0) {
        setCsvError('No valid data found in CSV file');
        return;
      }

      // Sort by Points (descending) to get top performers
      const sortedRows = rows.sort((a, b) => b.Points - a.Points);
      
      // Take top N names based on user selection
      const topNames = sortedRows
        .slice(0, topNamesCount)
        .map(row => row.Displayname)
        .filter(name => name && name.trim().length > 0);

      if (topNames.length === 0) {
        setCsvError('No valid display names found in CSV file');
        return;
      }

      // Confirm before replacing existing data
      const hasExistingData = names.some(name => name.trim().length > 0);
      if (hasExistingData) {
        const confirmed = window.confirm(
          `Import ${topNames.length} names from CSV?\n\nThis will replace existing name data.\n\nTop names to be imported:\n${topNames.slice(0, 5).join(', ')}${topNames.length > 5 ? '...' : ''}`
        );
        
        if (!confirmed) {
          return;
        }
      }

      // Set the names
      setNames(topNames);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      setCsvError(error instanceof Error ? error.message : 'Failed to process CSV file');
      console.error('CSV processing error:', error);
    } finally {
      setIsProcessingCSV(false);
    }
  };

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validation: Must have either items OR currency (or both), but only if sections are enabled
    const hasItems = isItemSectionEnabled && selectedItems.length > 0;
    const hasCurrency = isCurrencySectionEnabled && currencies.amount && currencies.amount.trim() !== '' && parseFloat(currencies.amount) > 0;
    const hasNames = names.some(name => name.trim().length > 0);
    
    if (!hasItems && !hasCurrency) {
      const enabledSections = [];
      if (isItemSectionEnabled) enabledSections.push('select at least one item ID');
      if (isCurrencySectionEnabled) enabledSections.push('specify a currency amount');
      
      if (enabledSections.length === 0) {
        alert('Please enable at least one distribution method (Items or Currency) and provide the required data.');
      } else {
        alert(`Please ${enabledSections.join(' OR ')} to give to users.`);
      }
      return;
    }
    
    if (!hasNames) {
      alert('Please enter at least one name.');
      return;
    }
    
    setIsSubmitting(true);
    
    // Show loading for 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsSubmitting(false);
    
    // Prepare submission data
    const submissionData = [];
    
    if (hasItems) {
      submissionData.push(`Items: ${selectedItems.join(', ')}`);
    }
    
    if (hasCurrency) {
      submissionData.push(`Currency: ${currencies.type} ${currencies.amount}`);
    }
    
    submissionData.push(`Recipients: ${names.filter(Boolean).join(', ')}`);
    
    alert(
      'Submission successful!\n\n' +
      submissionData.join('\n')
    );
  };

  const handleClearForm = () => {
    const hasData = selectedItems.length > 0 || names.some(name => name.trim().length > 0);
    
    if (!hasData) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to clear the entire form?\n\nThis will remove:\n' +
      `• ${selectedItems.length} selected item${selectedItems.length !== 1 ? 's' : ''}\n` +
      `• ${nameCount} entered name${nameCount !== 1 ? 's' : ''}\n\n` +
      'This action cannot be undone.'
    );

    if (confirmed) {
      setSelectedItems([]);
      setNames(['']);
      setItemInput('');
      setShowSuggestions(false);
      setCsvError(null);
      setCurrencies({ type: 'TC', amount: '' });
      
      // Reset section enable states
      setIsItemSectionEnabled(false);
      setIsCurrencySectionEnabled(false);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Focus the first name input after clearing
      setTimeout(() => {
        if (nameRefs.current[0]) {
          nameRefs.current[0]?.focus();
        }
      }, 0);
    }
  };

  const handleCurrencyChange = (field: keyof CurrencyEntry, value: string) => {
    const newCurrency = { ...currencies };
    if (field === 'type') {
      newCurrency[field] = value as 'TC' | 'CC' | 'MM';
    } else {
      newCurrency[field] = value;
    }
    setCurrencies(newCurrency);
  };

  const handleRemoveItem = (id: string) => {
    setSelectedItems(selectedItems.filter(item => item !== id));
  };

  const handleItemSelect = (id: string) => {
    if (!selectedItems.includes(id)) {
      setSelectedItems([...selectedItems, id]);
      setItemInput('');
    }
    setShowSuggestions(false);
  };

  const handleRetryLoadItems = () => {
    setItemsError(null);
    setIsLoadingItems(true);
    
    fetchItemIDs()
      .then(items => {
        setAvailableItems(items);
        setIsLoadingItems(false);
      })
      .catch(error => {
        setItemsError(error instanceof Error ? error.message : 'Failed to load items');
        setIsLoadingItems(false);
      });
  };

  // Handle section enable/disable with data clearing
  const handleItemSectionToggle = (enabled: boolean) => {
    setIsItemSectionEnabled(enabled);
    if (!enabled) {
      // Clear all item-related data when section is disabled
      setSelectedItems([]);
      setItemInput('');
      setShowSuggestions(false);
    }
  };

  const handleCurrencySectionToggle = (enabled: boolean) => {
    setIsCurrencySectionEnabled(enabled);
    if (!enabled) {
      // Clear currency data when section is disabled
      setCurrencies({ type: 'TC', amount: '' });
    }
  };

  const handleNameKeyDown = (e: KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === ' ' && !e.ctrlKey && !e.altKey && !e.metaKey) {
      const input = e.target as HTMLInputElement;
      const value = input.value;
      const cursor = input.selectionStart;
      
      if (cursor !== null && cursor === value.length && value.trim().length > 0) {
        const before = value.trim();
        const newNames = [...names];
        newNames[idx] = before;
        
        if (idx + 1 === newNames.length || newNames[idx + 1]) {
          newNames.splice(idx + 1, 0, '');
        }
        setNames(newNames);
        
        setTimeout(() => {
          if (nameRefs.current[idx + 1]) {
            nameRefs.current[idx + 1]?.focus();
            nameRefs.current[idx + 1]?.setSelectionRange(0, 0);
          }
        }, 0);
        e.preventDefault();
      }
    }
  };

  const handleNamePaste = (e: ClipboardEvent<HTMLInputElement>, idx: number) => {
    const paste = e.clipboardData.getData('text');
    const parts = paste.split(/\s+|,+/).filter(Boolean);
    
    if (parts.length > 1) {
      e.preventDefault();
      const newNames = [...names];
      const currentValue = newNames[idx];
      let insertIdx = idx;
      
      // If current input has text, start inserting from the next position
      if (currentValue && currentValue.trim().length > 0) {
        insertIdx = idx + 1;
      }
      
      // Insert the pasted parts
      for (let i = 0; i < parts.length; i++) {
        if (insertIdx + i < newNames.length) {
          newNames[insertIdx + i] = parts[i];
        } else {
          newNames.push(parts[i]);
        }
      }
      
      // If we started inserting from next position, ensure we have enough slots
      if (currentValue && currentValue.trim().length > 0) {
        // Add empty slots if needed between current and inserted items
        while (newNames.length < insertIdx + parts.length) {
          newNames.splice(insertIdx, 0, '');
        }
      }
      
      setNames(newNames);
      
      setTimeout(() => {
        const focusIndex = currentValue && currentValue.trim().length > 0 
          ? insertIdx + parts.length - 1 
          : idx + parts.length - 1;
        if (nameRefs.current[focusIndex]) {
          nameRefs.current[focusIndex]?.focus();
        }
      }, 0);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Prize Distribution Tool</h1>
        </div>
        
        {/* Professional loading overlay */}
        {isSubmitting && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingCard}>
              <Loader2 size={32} className={`animate-spin ${styles.loadingSpinner}`} />
              <div className={styles.loadingTitle}>
                Processing your request...
              </div>
              <div className={styles.loadingSubtitle}>
                Please wait while we handle your submission
              </div>
            </div>
          </div>
        )}
        
        <div className={styles.content}>
          <form onSubmit={handleSubmit}>
            <div className={styles.grid}>
              {/* Column 1: Item Selection */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <div className={styles.sectionTitleFlex}>
                    <Package size={20} />
                    Item Selection
                  </div>
                  <label className={styles.enableToggle}>
                    <input
                      type="checkbox"
                      checked={isItemSectionEnabled}
                      onChange={(e) => handleItemSectionToggle(e.target.checked)}
                      className={styles.enableCheckbox}
                    />
                    Enable
                  </label>
                </div>
                
                {/* Collapsible content */}
                {isItemSectionEnabled && (
                  <div className={styles.collapsibleContent}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="item-input" className={styles.label}>
                        Select Item IDs
                      </label>
                      {isLoadingItems ? (
                        <div className={`${styles.itemContainer} ${styles.loadingContainer}`}>
                          <Loader2 size={24} className={`animate-spin ${styles.loadingSpinner}`} />
                          <span className={styles.loadingText}>Loading items...</span>
                        </div>
                      ) : itemsError ? (
                        <div className={`${styles.itemContainer} ${styles.errorContainer}`}>
                          <AlertTriangle size={24} className={styles.errorIcon} />
                          <div className={styles.errorText}>
                            {itemsError}
                          </div>
                          <button
                            type="button"
                            onClick={handleRetryLoadItems}
                            className={styles.retryButton}
                          >
                            <RotateCcw size={14} />
                            Retry
                          </button>
                        </div>
                      ) : (
                        <div className={styles.itemContainerEnhanced}>
                          {selectedItems.length > 0 && (
                            <div className={styles.badgeContainer}>
                              {selectedItems.map(id => (
                                <div key={id} className={styles.badge}>
                                  {id}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(id)}
                                    className={styles.removeButton}
                                    aria-label={`Remove ${id}`}
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <input
                            id="item-input"
                            ref={itemInputRef}
                            type="text"
                            value={itemInput}
                            onChange={e => {
                              setItemInput(e.target.value);
                              setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                            autoComplete="off"
                            className={`${styles.input} ${styles.inputFullWidth}`}
                            placeholder={selectedItems.length === 0 ? 'Type to search items...' : 'Add more items...'}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Dropdown rendered outside container */}
                {showSuggestions && filteredItemIDs.length > 0 && isItemSectionEnabled && itemInputRef.current && (
                  <div 
                    className={styles.suggestionsDropdown}
                    style={{
                      top: `${itemInputRef.current.getBoundingClientRect().bottom + window.scrollY + 5}px`,
                      left: `${itemInputRef.current.getBoundingClientRect().left + window.scrollX}px`,
                      width: `${itemInputRef.current.getBoundingClientRect().width}px`
                    }}
                  >
                    {filteredItemIDs.map(id => (
                      <div
                        key={id}
                        onMouseDown={() => handleItemSelect(id)}
                        className={styles.suggestionItem}
                      >
                        <div className={styles.suggestionItemFlex}>
                          <Tag size={14} />
                          {id}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Currency Section */}
                <div className={styles.inputGroup}>
                  <div className={styles.currencySection}>
                    <div className={styles.sectionTitleFlex}>
                      <Coins size={20} />
                      Currency Management
                    </div>
                    <label className={styles.enableToggle}>
                      <input
                        type="checkbox"
                        checked={isCurrencySectionEnabled}
                        onChange={(e) => handleCurrencySectionToggle(e.target.checked)}
                        className={styles.enableCheckbox}
                      />
                      Enable
                    </label>
                  </div>
                  
                  {/* Collapsible currency content */}
                  {isCurrencySectionEnabled && (
                    <div className={styles.collapsibleContent}>
                      <div className={styles.currencyContainer}>
                        <div className={styles.currencyGrid}>
                          {/* Currency Type Dropdown */}
                          <div>
                            <label className={styles.currencyFieldLabel}>
                              Type
                            </label>
                            <select
                              value={currencies.type}
                              onChange={(e) => handleCurrencyChange('type', e.target.value)}
                              className={styles.currencySelect}
                            >
                              <option value="MM">MM</option>
                              <option value="TC">TC</option>
                              <option value="CC">CC</option>
                            </select>
                          </div>

                          {/* Amount Input */}
                          <div>
                            <label className={styles.currencyFieldLabel}>
                              Amount
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={currencies.amount}
                              onChange={(e) => handleCurrencyChange('amount', e.target.value)}
                              placeholder="0"
                              className={styles.currencyInput}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* CSV Upload Section */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    <FileText size={16} className={styles.csvInlineIcon} />
                    Import names from CSV
                  </label>
                  <div className={styles.csvUploadContainer}>
                    <div className={styles.csvUploadContent}>
                      <Upload size={24} className={styles.csvUploadIcon} />
                      <div>
                        <p className={styles.csvUploadTitle}>
                          Upload CSV to import top {topNamesCount} names
                        </p>
                        <p className={styles.csvUploadSubtitle}>
                          Sorted by Points (highest first)
                        </p>
                      </div>

                      {/* Number of names selector */}
                      <div className={styles.csvCountSelector}>
                        <label className={styles.csvCountLabel}>
                          Import top:
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="200"
                          value={topNamesCount}
                          onChange={(e) => setTopNamesCount(Math.max(1, Math.min(200, parseInt(e.target.value) || 1)))}
                          className={styles.csvCountInput}
                        />
                        <span className={styles.csvCountText}>
                          names
                        </span>
                      </div>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleCSVUpload}
                        disabled={isProcessingCSV}
                        className={styles.csvHiddenInput}
                        id="csv-upload"
                      />
                      
                      <label
                        htmlFor="csv-upload"
                        className={`${styles.csvUploadButton} ${isProcessingCSV ? styles.csvUploadButtonDisabled : ''}`}
                      >
                        {isProcessingCSV ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Upload size={16} />
                            Choose CSV File
                          </>
                        )}
                      </label>
                    </div>
                    
                    {csvError && (
                      <div className={styles.errorMessage}>
                        <AlertTriangle size={14} />
                        {csvError}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Column 2: Name Inputs */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <Users size={20} />
                  Name Entry
                </div>
                
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Names</label>
                  <div className={styles.namesGrid}>
                    {names.map((name, idx) => {
                      const isDuplicate = isNameDuplicate(name);
                      return (
                        <input
                          key={idx}
                          ref={el => { nameRefs.current[idx] = el; }}
                          type="text"
                          value={name}
                          onChange={e => handleNameChange(idx, e.target.value)}
                          onKeyDown={e => handleNameKeyDown(e, idx)}
                          onPaste={e => handleNamePaste(e, idx)}
                          placeholder={`Name #${idx + 1}`}
                          required={idx === 0}
                          className={`${styles.nameInput} ${isDuplicate ? styles.nameInputDuplicate : ''}`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Name Statistics */}
                {nameCount > 0 && (
                  <div className={styles.inputGroup}>
                    <div className={styles.nameStatsContainer}>
                      <div className={`${styles.nameStatsHeader} ${hasDuplicates ? styles.nameStatsHeaderWithDuplicates : ''}`}>
                        <BarChart3 size={16} />
                        <span><strong>{nameCount}</strong> name{nameCount !== 1 ? 's' : ''} entered</span>
                      </div>
                      
                      {hasDuplicates && (
                        <div className={styles.duplicateError}>
                          <div className={styles.duplicateErrorHeader}>
                            <AlertTriangle size={16} />
                            <span>Duplicate names detected!</span>
                          </div>
                          <ul className={styles.duplicateList}>
                            {duplicateNames.map(({ name, count }) => (
                              <li key={name} className={styles.duplicateListItem}>
                                &ldquo;<strong>{name}</strong>&rdquo; appears {count} times
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Section */}
            <div className={styles.submitSection}>
              <div className={styles.submitButtonsContainer}>
                <button 
                  type="button"
                  onClick={handleClearForm}
                  className={styles.clearButton}
                >
                  <Trash2 size={16} />
                  Clear Form
                </button>
                
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={
                    isLoadingItems || 
                    isSubmitting || 
                    (
                      (!isItemSectionEnabled || selectedItems.length === 0) && 
                      (!isCurrencySectionEnabled || !currencies.amount || parseFloat(currencies.amount) < 1)
                    )
                  }
                >
                  {isSubmitting ? 'Processing...' : isLoadingItems ? 'Loading...' : 'Distribute Rewards'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
