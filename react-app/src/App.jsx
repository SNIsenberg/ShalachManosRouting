import { useEffect, useState, useRef } from 'react'
import './App.css'
import OpenRouter from './openroute'

function DeliveryItem({ index, address, onChange, onDelete, onAddressLookup, showCoordinates }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState({ ...address })

  useEffect(() => {
    if (isEditing) {
      setDraft({ ...address })
    }
  }, [isEditing])

  useEffect(() => {
    if (!isEditing) {
      setDraft({ ...address })
    }
  }, [address])

  const updateField = (field, value) => {
    setDraft(prev => ({ ...prev, [field]: value }))
  }

  const save = async () => {
    const addressChanged = draft.address && draft.address !== address.address
    onChange(index, draft)
    setIsEditing(false)
    if (addressChanged && onAddressLookup) {
      await onAddressLookup(index, draft.address)
    }
  }

  const cancel = () => {
    setDraft({ ...address })
    setIsEditing(false)
  }

  return (
    <tr>
      <td>
        {isEditing ? (
          <input value={draft.name || ''} onChange={e => updateField('name', e.target.value)} />
        ) : (
          address.name || ''
        )}
      </td>
      <td>
        {isEditing ? (
          <input value={draft.address || ''} onChange={e => updateField('address', e.target.value)} />
        ) : (
          address.address || ''
        )}
      </td>
      <td>
        {isEditing ? (
          <input value={draft.zip || ''} onChange={e => updateField('zip', e.target.value)} />
        ) : (
          address.zip || ''
        )}
      </td>
      {showCoordinates ? (
        <>
          <td>
            {address.longitude || ''}
          </td>
          <td>
            {address.latitude || ''}
          </td>
        </>
      ) : null}
      <td>
        {isEditing ? (
          <>
            <input type="time" value={draft.start || ''} onChange={e => updateField('start', e.target.value)} />
            {' - '}
            <input type="time" value={draft.end || ''} onChange={e => updateField('end', e.target.value)} />
          </>
        ) : address.start && address.end ? (
          `${address.start} - ${address.end}`
        ) : (
          ''
        )}
      </td>
      <td>{address.route_index || ''}</td>
      <td>{address.arrival || ''}</td>
      <td>
        {isEditing ? (
          <>
            <button onClick={save}>Save</button>
            <button onClick={cancel}>Cancel</button>
            <button onClick={() => onDelete(index)}>Delete</button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)}>Edit</button>
            <button onClick={() => onDelete(index)}>Delete</button>
          </>
        )}
      </td>
    </tr>
  )
}

function VehicleItem({ index, vehicle, onChange, onDelete, showCoordinates }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState({ ...vehicle })

  useEffect(() => {
    if (!isEditing) {
      setDraft({ ...vehicle })
    }
  }, [vehicle, isEditing])

  const updateField = (field, value) => {
    setDraft(prev => ({ ...prev, [field]: value }))
  }

  const updateCoordinate = (field, value) => {
    const valueParts = value.split(',').map(v => v.trim())
    if (valueParts.length === 2) {
      setDraft(prev => ({ ...prev, [field]: [parseFloat(valueParts[0]) || 0, parseFloat(valueParts[1]) || 0] }))
    } else {
      setDraft(prev => ({ ...prev, [field]: value }))
    }
  }

  const updateTimeWindow = (subIndex, value) => {
    setDraft(prev => {
      const tw = [...(prev.time_window || ['', ''])]
      tw[subIndex] = value
      return { ...prev, time_window: tw }
    })
  }

  const save = () => {
    onChange(index, draft)
    setIsEditing(false)
  }

  const cancel = () => {
    setDraft({ ...vehicle })
    setIsEditing(false)
  }

  return (
    <tr>
      <td>{vehicle.id}</td>
      <td>
        {isEditing ? (
          <input value={draft.description || ''} onChange={e => updateField('description', e.target.value)} />
        ) : (
          vehicle.description || ''
        )}
      </td>
      <td>
        {isEditing ? (
          <input value={draft.profile || 'driving-car'} onChange={e => updateField('profile', e.target.value)} />
        ) : (
          vehicle.profile || ''
        )}
      </td>
      {showCoordinates ? (
        <>
          <td>
            {isEditing ? (
              <input
                value={(draft.start || []).join(',')}
                onChange={e => updateCoordinate('start', e.target.value)}
              />
            ) : (
              (vehicle.start || []).join(',')
            )}
          </td>
          <td>
            {isEditing ? (
              <input
                value={(draft.end || []).join(',')}
                onChange={e => updateCoordinate('end', e.target.value)}
              />
            ) : (
              (vehicle.end || []).join(',')
            )}
          </td>
        </>
      ) : (
        <td>
          {isEditing ? (
            <>
              <input
                style={{ width: 'calc(50% - 8px)', marginRight: '8px' }}
                value={(draft.start || []).join(',')}
                onChange={e => updateCoordinate('start', e.target.value)}
                placeholder="start"
              />
              <input
                style={{ width: 'calc(50% - 8px)' }}
                value={(draft.end || []).join(',')}
                onChange={e => updateCoordinate('end', e.target.value)}
                placeholder="end"
              />
            </>
          ) : vehicle.start && vehicle.end ? (
            `${(vehicle.start || []).map(c => parseFloat(c).toFixed(3)).join(', ')}  /  ${(vehicle.end || []).map(c => parseFloat(c).toFixed(3)).join(', ')}`
          ) : (
            ''
          )}
        </td>
      )}
      <td>
        {isEditing ? (
          <>
            <input
              type="time"
              value={(draft.time_window || ['', ''])[0]}
              onChange={e => updateTimeWindow(0, e.target.value)}
            />
            {' - '}
            <input
              type="time"
              value={(draft.time_window || ['', ''])[1]}
              onChange={e => updateTimeWindow(1, e.target.value)}
            />
          </>
        ) : vehicle.time_window ? (
          `${vehicle.time_window[0]} - ${vehicle.time_window[1]}`
        ) : (
          ''
        )}
      </td>
      <td>
        {isEditing ? (
          <>
            <button onClick={save}>Save</button>
            <button onClick={cancel}>Cancel</button>
            <button onClick={() => onDelete(index)}>Delete</button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)}>Edit</button>
            <button onClick={() => onDelete(index)}>Delete</button>
          </>
        )}
      </td>
    </tr>
  )
}

function App() {
  // state for settings
  const [apiKey, setApiKey] = useState('')
  const [boundary, setBoundary] = useState('')

  // lookup address state
  const [lookupAddress, setLookupAddress] = useState({})

  // lists of addresses and vehicles
  const [addresses, setAddresses] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [showCoordinates, setShowCoordinates] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const fileInputRef = useRef()

  // load saved settings/state on mount
  useEffect(() => {
    const key = localStorage.getItem('apiKey')
    if (key) setApiKey(key)
    const bound = localStorage.getItem('boundary')
    if (bound) setBoundary(bound)

    const saved = localStorage.getItem('savedState')
    if (saved) {
      try {
        const { vehicles: v, addresses: a } = JSON.parse(saved)
        setVehicles(v)
        setAddresses(a)
      } catch {}
    }
  }, [])

  // persist settings when they change
  useEffect(() => {
    localStorage.setItem('apiKey', apiKey)
  }, [apiKey])
  useEffect(() => {
    localStorage.setItem('boundary', boundary)
  }, [boundary])

  // update lookupAddress helper
  const updateLookupField = (field, value) => {
    setLookupAddress(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    if (!lookupAddress.address || lookupAddress.address.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const buildAutocompleteUrl = () => {
      const query = encodeURIComponent(lookupAddress.address)
      let url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&q=${query}`
      if (boundary) {
        const trimmed = boundary.trim()
        if (/^[a-zA-Z]{2}$/.test(trimmed)) {
          url += `&countrycodes=${encodeURIComponent(trimmed)}`
        } else if (/^[^=]+=[^=]+$/.test(trimmed)) {
          url += `&${encodeURIComponent(trimmed)}`
        } else {
          const parts = trimmed.split(',').map(s => s.trim())
          if (parts.length === 4 && parts.every(p => !Number.isNaN(Number(p)))) {
            url += `&viewbox=${parts.join(',')}&bounded=1`
          }
        }
      }
      return url
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const url = buildAutocompleteUrl()
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        })
        const results = await response.json()
        setSuggestions(
          results.map(item => ({
            display_name: item.display_name,
            lat: item.lat,
            lon: item.lon,
            postcode: item.address?.postcode || '',
          }))
        )
        setShowSuggestions(results.length > 0)
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Autocomplete error', error)
        }
      }
    }, 250)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [lookupAddress.address, boundary])

  const lookupAddressButton = async () => {
    const router = new OpenRouter(apiKey, boundary)
    await router.lookup(lookupAddress)
    // trigger re-render with updated address
    setLookupAddress({ ...lookupAddress })
  }

  const buildStreetLabel = suggestion => {
    if (!suggestion.address) {
      return suggestion.display_name
    }

    const street =
      suggestion.address.road ||
      suggestion.address.pedestrian ||
      suggestion.address.cycleway ||
      suggestion.address.footway ||
      suggestion.address.path ||
      suggestion.address.residential ||
      suggestion.address.neighbourhood ||
      suggestion.address.suburb

    const houseNumber = suggestion.address.house_number
    if (street) {
      return houseNumber ? `${houseNumber} ${street}` : street
    }

    return suggestion.display_name
  }

  const selectSuggestion = suggestion => {
    setLookupAddress(prev => ({
      ...prev,
      address: buildStreetLabel(suggestion),
      zip: suggestion.postcode || prev.zip,
      longitude: parseFloat(suggestion.lon),
      latitude: parseFloat(suggestion.lat),
    }))
    setSuggestions([])
    setShowSuggestions(false)
  }

  const addDelivery = () => {
    setAddresses(prev => [...prev, lookupAddress])
    setLookupAddress({})
  }

  const addVehicle = () => {
    const location = [lookupAddress.longitude, lookupAddress.latitude]
    const timeWindow = [lookupAddress.start, lookupAddress.end]
    setVehicles(prev => [
      ...prev,
      {
        id: prev.length + 1,
        description: lookupAddress.name,
        profile: 'driving-car',
        start: location,
        end: location,
        time_window: timeWindow,
      },
    ])
    setLookupAddress({})
  }

  const route = async () => {
    const router = new OpenRouter(apiKey, boundary)
    // clear existing route fields before recomputing, but only update state after success
    const addrCopy = addresses.map(a => ({
      ...a,
      route_index: '',
      arrival: '',
    }))

    try {
      const updated = await router.route(addrCopy, vehicles.map(v => ({ ...v })))
      setAddresses(updated)
    } catch (error) {
      console.error('Routing failed', error)
    }
  }

  const exportData = () => {
    const fileData = JSON.stringify({ vehicles, addresses })
    const blob = new Blob([fileData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = 'routing.json'
    link.href = url
    link.click()
  }

  const readJsonFile = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => {
        if (e.target) resolve(JSON.parse(e.target.result))
      }
      reader.onerror = err => reject(err)
      reader.readAsText(file)
    })
  }

  const handleImport = async e => {
    if (e.target.files && e.target.files[0]) {
      const { vehicles: v, addresses: a } = await readJsonFile(e.target.files[0])
      setVehicles(v)
      setAddresses(a)
    }
  }

  const saveState = () => {
    localStorage.setItem(
      'savedState',
      JSON.stringify({ vehicles, addresses })
    )
  }

  const clearAddresses = () => setAddresses([])
  const clearVehicles = () => setVehicles([])

  const updateAddress = (index, updated) => {
    setAddresses(prev => prev.map((item, i) => (i === index ? updated : item)))
  }

  const removeAddress = index => {
    setAddresses(prev => prev.filter((_, i) => i !== index))
  }

  const updateVehicle = (index, updated) => {
    setVehicles(prev => prev.map((item, i) => (i === index ? updated : item)))
  }

  const removeVehicle = index => {
    setVehicles(prev => prev.filter((_, i) => i !== index))
  }

  const lookupDeliveryAddress = async (index, addressText) => {
    if (!addressText) return
    const router = new OpenRouter(apiKey, boundary)
    const lookupObj = { address: addressText }
    await router.lookup(lookupObj)
    setAddresses(prev =>
      prev.map((item, i) => (i === index ? { ...item, ...lookupObj } : item))
    )
  }

  const sortByRoute = () => {
    setAddresses(prev => {
      const sorted = [...prev].sort((a, b) => {
        const aEmpty = !a.route_index
        const bEmpty = !b.route_index
        if (aEmpty && bEmpty) return 0
        if (aEmpty) return 1
        if (bEmpty) return -1

        const [aVehicle, aIndex] = a.route_index.split('-').map(Number)
        const [bVehicle, bIndex] = b.route_index.split('-').map(Number)
        if (aVehicle !== bVehicle) return aVehicle - bVehicle
        return aIndex - bIndex
      })
      return sorted
    })
  }

  // computed booleans for button disable
  const canLookup = lookupAddress.address && lookupAddress.address !== ''
  const canAddDelivery = lookupAddress.latitude != null
  const canAddVehicle =
    lookupAddress.latitude != null &&
    lookupAddress.start &&
    lookupAddress.end
  
  const hasRouteData = addresses.some(a => a.route_index)

  return (
    <div className="app-container">
      <div id="settings">
        <label>
          Routing key{' '}
          <input
            type="text"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
          />
        </label>{' '}
        <label>
          Boundary{' '}
          <input
            type="text"
            value={boundary}
            onChange={e => setBoundary(e.target.value)}
          />
        </label>
      </div>

      <table id="lookupFields">
        <tbody>
          <tr>
            <th>Name</th>
            <td>
              <input
                name="name"
                value={lookupAddress.name || ''}
                onChange={e => updateLookupField('name', e.target.value)}
              />
            </td>
            <th>Start</th>
            <td>
              <input
                type="time"
                value={lookupAddress.start || ''}
                onChange={e => updateLookupField('start', e.target.value)}
              />
            </td>
          </tr>
          <tr>
            <th>Address</th>
            <td>
              <div className="autocomplete">
                <input
                  type="text"
                  value={lookupAddress.address || ''}
                  onChange={e => updateLookupField('address', e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true)
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                />
                {showSuggestions && suggestions.length > 0 ? (
                  <div className="autocomplete-list">
                    {suggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="autocomplete-item"
                        onMouseDown={() => selectSuggestion(item)}
                      >
                        {item.display_name}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </td>
            <th>End</th>
            <td>
              <input
                type="time"
                value={lookupAddress.end || ''}
                onChange={e => updateLookupField('end', e.target.value)}
              />
            </td>
          </tr>
          <tr>
            <th>Zip</th>
            <td>{lookupAddress.zip || ''}</td>
          </tr>
          <tr>
            <th>Longitude</th>
            <td>{lookupAddress.longitude || ''}</td>
          </tr>
          <tr>
            <th>Latitude</th>
            <td>{lookupAddress.latitude || ''}</td>
          </tr>
        </tbody>
      </table>

      <div id="buttons">
        <button onClick={lookupAddressButton} disabled={!canLookup}>
          Lookup Address
        </button>
        <button onClick={addDelivery} disabled={!canAddDelivery}>
          Add Delivery
        </button>
        <button onClick={addVehicle} disabled={!canAddVehicle}>
          Add Vehicle
        </button>
        <button onClick={() => setShowCoordinates(prev => !prev)}>
          {showCoordinates ? 'Minimize coordinates' : 'Show coordinates'}
        </button>
        <br />
        <button onClick={route}>Route</button>
        <button onClick={sortByRoute} disabled={!hasRouteData}>
          Sort by route
        </button>
        <button onClick={saveState}>Save</button>
        <button onClick={clearAddresses}>Clear deliveries</button>
        <button onClick={clearVehicles}>Clear Vehicles</button>
        <br />
        <button onClick={exportData}>Export</button>
        <input
          type="file"
          accept=".json,application/json"
          ref={fileInputRef}
          onChange={handleImport}
        />
      </div>

      <div className="table-responsive">
        <table border="1">
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Zip</th>
              {showCoordinates ? (
                <>
                  <th>Longitude</th>
                  <th>Latitude</th>
                </>
              ) : null}
              <th>Time Window</th>
              <th>Route Index</th>
              <th>Arrival</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {addresses.map((address, idx) => (
              <DeliveryItem
                key={idx}
                index={idx}
                address={address}
                showCoordinates={showCoordinates}
                onChange={updateAddress}
                onDelete={removeAddress}
                onAddressLookup={lookupDeliveryAddress}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-responsive">
        <table border="1">
          <thead>
            <tr>
              <th>ID</th>
              <th>Description</th>
              <th>Profile</th>
              {showCoordinates ? (
                <>
                  <th>Start</th>
                  <th>End</th>
                </>
              ) : (
                <th>Coords</th>
              )}
              <th>Time Window</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v, idx) => (
              <VehicleItem
                key={idx}
                index={idx}
                vehicle={v}
                showCoordinates={showCoordinates}
                onChange={updateVehicle}
                onDelete={removeVehicle}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App
