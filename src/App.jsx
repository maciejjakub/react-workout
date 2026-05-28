import { useState } from 'react';
import './App.css';

const services = [
  { id: 1, name: 'sales-api', namespace: 'prod', replicas: 5, cpuPercent: 81, status: 'healthy'},
  { id: 2, name: 'payment-api', namespace: 'prod', replicas: 3, cpuPercent: 79, status: 'healthy'},
  { id: 3, name: 'cat-photo-api', namespace: 'test', replicas: 2, cpuPercent: 21, status: 'down'},
  { id: 4, name: 'marketing-api', namespace: 'test', replicas: 7, cpuPercent: 44, status: 'healthy'},
  { id: 5, name: 'cloud-api', namespace: 'prod', replicas: 2, cpuPercent: 56, status: 'degraded'},
]

const statusPriority = { down: 0, degraded: 1, healthy: 2 };

const sortedServices = [...services].sort(
    (a, b) => statusPriority[a.status] - statusPriority[b.status]
  );

function PodStatus() {
  return (
    <div className="pod">
      <h2>nginx-7d4f8c-x9k2m</h2>
      <p>Status: Running<br />
      Restarts: 0
      </p>
      <img src="/icons/healthy.svg"></img>
    </div>
  )
}

function restartService(serviceName) {
  alert(`Restarting ${serviceName}`);
}

function AckButton(props) {
  
  function acknowledgeClick() {
    props.setAcknowledge(true);
  }

  return (
    <button className="service-card__action-button" onClick={acknowledgeClick}>
      {props.acknowledged ? ('Acknowledged') : ('Acknowledge') }
    </button>
  )
}

function ServiceCard({service}) {
  const [acknowledged, setAcknowledge] = useState(false);
  const cpuColor = service.cpuPercent > 80 ? 'red' : 'inherit';

  let content;
  if (service.status === 'healthy') {
    content = <p>✅</p>;
  } else if (service.status === 'degraded') {
    content = <p>⚠️ Degraded - check logs</p>;
  } else if (service.status === 'down') {
    content = <p>❌ Service unavailable</p>;
  }


  let serviceClassName
  if (acknowledged) {
    serviceClassName = `service-card-acknowledged service-card--${service.status}`
  } else {
    serviceClassName = `service-card service-card--${service.status}`
  }

  return (
    <div className="service-card__body">
      <div className={serviceClassName}>
        <h2>{service.namespace}/{service.name}</h2>
        <p>Replicas: {service.replicas}</p>
        <p style={{ color: cpuColor }}>CPU: {service.cpuPercent}%</p>
        <p>Endpoint: https://{service.name}.{service.namespace}.svc.cluster.local</p>
        {content}
      </div>

      <button className="service-card__action-button" onClick={() => restartService(service.name)}>
        Restart
      </button>

      <AckButton acknowledged={acknowledged} setAcknowledge={setAcknowledge} />
      
    </div>
  );

}

function ServicesList() {
  return (
    <ul>
      {sortedServices.map(service => {
        return (
          <li key={service.id}>
            <ServiceCard service={service} />
          </li>
      )})}
    </ul>
  )
}

function ServicesListClassic() {
  const listItems = sortedServices.map((service) => {
    let content;
    if (service.status === 'healthy') {
      content = <p>✅</p>;
    } else if (service.status === 'degraded') {
      content = <p>⚠️ Degraded - check logs</p>;
    } else if (service.status === 'down') {
      content = <p>❌ Service unavailable</p>;
    }

    const cpuColor = service.cpuPercent > 80 ? 'red' : 'inherit';

    const [acknowledged, setAcknowledge] = useState(false);

    let serviceClassName
    if (acknowledged) {
      serviceClassName = `service-card-acknowledged service-card--${service.status}`
    } else {
      serviceClassName = `service-card service-card--${service.status}`
    }

    return (
      <li key={service.id}>
        <div className="service-card__body">
          <div className={serviceClassName}>
            <h2>{service.namespace}/{service.name}</h2>
            <p>Replicas: {service.replicas}</p>
            <p style={{ color: cpuColor }}>CPU: {service.cpuPercent}%</p>
            <p>Endpoint: https://{service.name}.{service.namespace}.svc.cluster.local</p>
            {content}
          </div>

          <button className="service-card__action-button" onClick={() => restartService(service.name)}>
            Restart
          </button>

          <AckButton acknowledged={acknowledged} setAcknowledge={setAcknowledge} />
          
        </div>
      </li>
    );
  });

  return <ul>{listItems}</ul>;
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
