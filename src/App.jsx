import { useEffect, useState } from 'react';
import clsx from 'clsx';
import './App.css';

// const services = [
//   { id: 1, name: 'sales-api', namespace: 'prod', replicas: 5, cpuPercent: 81, status: 'healthy'},
//   { id: 2, name: 'payment-api', namespace: 'prod', replicas: 3, cpuPercent: 79, status: 'healthy'},
//   { id: 3, name: 'cat-photo-api', namespace: 'test', replicas: 2, cpuPercent: 21, status: 'down'},
//   { id: 4, name: 'marketing-api', namespace: 'test', replicas: 7, cpuPercent: 44, status: 'healthy'},
//   { id: 5, name: 'cloud-api', namespace: 'prod', replicas: 2, cpuPercent: 56, status: 'degraded'},
// ]

const statusPriority = { down: 0, degraded: 1, healthy: 2 };

function RestartButton(props){
  const [count, setCount] = useState(0);

  function handleClick() {
    alert(`Restarting ${props.serviceName}`);
    setCount(count + 1);
  }

  return (
    <div>
      <p>Restarted {count} times.</p>
      <button className="service-card__action-button" onClick={handleClick}>
        Restart
      </button>
    </div>
  );
}

function AckAllButton(props) {
  function ackAllClick() {
    props.setMainAckState(prevStates => 
      Object.fromEntries(
        Object.entries(prevStates).map(([id, value]) => [id, true])
      )
    )
  }

  return (
    <div>
      <button className="service-card__action-button" onClick={ackAllClick}>
        Acknowledge All Services
      </button>
    </div>
  )

}

function AckButton(props) {
  
  function acknowledgeClick() {
    props.setMainAckState(prevStates => {
      return {
        ...prevStates,
        [props.serviceId]: !prevStates[props.serviceId]
      };
    });
  }

  return (
    <div>
      <button className="service-card__action-button" onClick={acknowledgeClick}>
        { props.mainAckState[props.serviceId] ? ('Deacknowledge') : ('Acknowledge') }
      </button>
    </div>
  )
}

function ServiceCard(props) {
  const service = props.service;

  const cpuColor = service.cpuPercent > 80 ? 'red' : 'inherit';

  let content;
  if (service.status === 'healthy') {
    content = <p>✅</p>;
  } else if (service.status === 'degraded') {
    content = <p>⚠️ Degraded - check logs</p>;
  } else if (service.status === 'down') {
    content = <p>❌ Service unavailable</p>;
  }

  const classes = clsx(
    'service-card',
    `service-card--${service.status}`,
    props.mainAckState[service.id] && 'service-card--acknowledged'
  );

  return (
    <div className="service-card__body">
      <div className={classes}>
        <h2>{service.namespace}/{service.name}</h2>
        <p>Replicas: {service.replicas}</p>
        <p style={{ color: cpuColor }}>CPU: {service.cpuPercent}%</p>
        <p>Endpoint: https://{service.name}.{service.namespace}.svc.cluster.local</p>
        {content}
      </div>

      <RestartButton serviceName={service.name} serviceStatus={service.status} />

      <AckButton mainAckState={props.mainAckState} setMainAckState={props.setMainAckState} serviceId={service.id} />

    </div>
  );

}

function ServicesList() {
  // const mainAckStateInit = Object.fromEntries(
  //   sortedServices.map(service => [service.id, false])
  // )

  const [mainAckState, setMainAckState] = useState([]);

  const [services, setServices] = useState([]);

  // State setter (fetches services list from the backend)
  useEffect(() => {
    const fetchMetrics = () => 
      fetch('http://localhost:8000/metrics')
        .then((res) => res.json())
        .then(setServices);
    
    fetchMetrics();
    const id = setInterval(fetchMetrics, 3000);

    return () => clearInterval(id);
  }, []);

  // reconciler - for acknowledgement state
  useEffect(() => {
    setMainAckState(prev => 
      Object.fromEntries(
        services.map(service => [service.id, prev[service.id] ?? false])
      )
    )
  }, [services]);

  const sortedServices = [...services].sort(
    (a, b) => statusPriority[a.status] - statusPriority[b.status]
  );

  const servicesCount = Object.keys(mainAckState).length
  const ackCount = Object.values(mainAckState).filter(Boolean).length;

  const listItems = sortedServices.map(service => {
    return (
      <li key={service.id}>
        <ServiceCard service={service} mainAckState={mainAckState} setMainAckState={setMainAckState} />
      </li>
    )
  })

  return (
    <div>
      <h2>{ackCount} of {servicesCount} acknowledged.</h2>
      <AckAllButton mainAckState={mainAckState} setMainAckState={setMainAckState} />
      {listItems}
    </div>
  )
}

function ServiceDashboard() {
  return (
    <>
      <h1>Services</h1>
      <ServicesList />
    </>
  )
}

export default function App() {
  return <ServiceDashboard />
}
