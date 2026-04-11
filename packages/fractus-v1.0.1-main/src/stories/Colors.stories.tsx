import React from 'react';

export default { title: 'Design System/Cores' };

// Mini-componente para padronizar os quadrados de cor e deixar o código limpo
const ColorBox = ({ name, hex, textColor = '#fff', borderColor = 'transparent' }) => (
    <div style={{ background: hex, padding: '20px', color: textColor, border: `1px solid ${borderColor}`, borderRadius: '8px', width: '180px', flexShrink: 0 }}>
        <strong style={{ display: 'block', marginBottom: '8px' }}>{name}</strong>
        <span style={{ fontFamily: 'monospace', fontSize: '14px' }}>{hex}</span>
    </div>
);

export const Paleta = () => (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1200px' }}>
        <h2 style={{ marginBottom: '2rem', fontSize: '24px', color: '#333' }}>Paleta de Cores do Projeto</h2>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', color: '#555' }}>
            Principais e Secundárias
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <ColorBox name="Primary Default" hex="#F05B3F" />
            <ColorBox name="Primary Hover" hex="#F37D5E" />
            <ColorBox name="Secondary Default" hex="#049DDB" />
            <ColorBox name="Secondary Hover" hex="#4AACE1" />
        </div>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', color: '#555' }}>
            Fundos e Neutros
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <ColorBox name="Background" hex="#F8F9FF" textColor="#000" borderColor="#e2e8f0" />
            <ColorBox name="Terceary" hex="#EEF0F7" textColor="#000" borderColor="#e2e8f0" />
            <ColorBox name="Cinza" hex="#5A5A5A" />
        </div>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', color: '#555' }}>
            Amarelos
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <ColorBox name="Amarelo Claro 1" hex="#FEC333" textColor="#000" />
            <ColorBox name="Amarelo Claro 2" hex="#FFCD62" textColor="#000" />
            <ColorBox name="Amarelo Escuro 1" hex="#FAA633" />
            <ColorBox name="Amarelo Escuro 2" hex="#FDB65E" />
        </div>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', color: '#555' }}>
            Azuis
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <ColorBox name="Azul Escuro" hex="#3676BC" />
            <ColorBox name="Azul Escuro 2" hex="#618AC7" />
        </div>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', color: '#555' }}>
            Verdes
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <ColorBox name="Verde Escuro" hex="#1B987E" />
            <ColorBox name="Verde Claro" hex="#5AA791" />
        </div>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', color: '#555' }}>
            Rosas
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <ColorBox name="Rosa Escuro" hex="#F1678D" />
            <ColorBox name="Rosa Claro" hex="#F485A0" />
        </div>

    </div>
);