export default class OpenRouter {
  constructor(apikey, boundary) {
    this.apikey = apikey
    this.baseurl = 'https://api.openrouteservice.org'
    this.boundary = boundary
  }

  timeToSeconds(timeInput) {
    if (!timeInput || typeof timeInput !== 'string') {
      return 0
    }
    const parts = timeInput.split(':')
    if (parts.length < 2) {
      return 0
    }
    const [hours, minutes] = parts.map(Number)
    return hours * 3600 + minutes * 60
  }

  formatSecondsToTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;

    return formattedTime;
  }

  async lookup(address) {
    let params = {
      api_key: this.apikey,
      text: address.address,
    };
    let boundary = this.boundary;
    if (boundary && boundary != '') {
      params['boundary.gid'] = boundary;
    }
    const url =
      this.baseurl + '/geocode/search?' + new URLSearchParams(params).toString();
    let response = await fetch(url);
    let json = await response.json();
    if (json.features && json.features[0]) {
      const gc = json.features[0];
      address.address = gc.properties.name;
      address.zip = gc.properties.postalcode;
      address.longitude = gc.geometry.coordinates[0];
      address.latitude = gc.geometry.coordinates[1];
    }
  }

  async route(addresses, vehicles) {
    const DEFAULT_START = 0 // 00:00
    const DEFAULT_END = 86399 // 23:59

    const jobs = {
      jobs: addresses.map((address, i) => {
        const job = {
          id: i + 1,
          description: address.name,
          location: [address.longitude, address.latitude],
          service: 300,
        };
        if (address.start && address.end) {
          job.time_windows = [[
            this.timeToSeconds(address.start),
            this.timeToSeconds(address.end),
          ]];
        } else {
          // Default to full day if no time window specified
          job.time_windows = [[DEFAULT_START, DEFAULT_END]];
        }
        return job;
      }),
      vehicles: vehicles.map(v => {
        const timeWindowValues = (v.time_window || []).filter(t => t && typeof t === 'string').map(this.timeToSeconds.bind(this))
        const vehicleObj = {
          id: v.id,
          profile: v.profile,
          start: Array.isArray(v.start) ? v.start : [0, 0],
          end: Array.isArray(v.end) ? v.end : [0, 0],
        }
        if (timeWindowValues.length === 2) {
          vehicleObj.time_window = timeWindowValues
        } else {
          // Default to full day if no time window specified
          vehicleObj.time_window = [DEFAULT_START, DEFAULT_END]
        }
        return vehicleObj
      }),
    };
    const headers = {
      Accept: 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
      'Content-Type': 'application/json',
      Authorization: this.apikey,
    };
    const url = this.baseurl + '/optimization';
    const request = new Request(url, {
      headers: headers,
      method: 'POST',
      body: JSON.stringify(jobs),
    });
    const response = await fetch(request);
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Routing request failed: ${response.status} ${response.statusText} - ${errorText}`)
    }
    const routing = await response.json();
    if (!routing.routes || !routing.routes.length) {
      return addresses
    }

    for (let idx in routing.routes) {
      let route = routing.routes[idx];
      route.steps.forEach((step, index) => {
        if (step.type == 'job') {
          let address = addresses[step.id - 1];
          address.route_index = route.vehicle + '-' + index;
          address.arrival = this.formatSecondsToTime(step.arrival);
        }
      });
    }

    return addresses
  }
}
