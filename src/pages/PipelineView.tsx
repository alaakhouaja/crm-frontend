import { useCallback, useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { 
  RefreshCw, 
  Building2, 
  MoreVertical, 
  Calendar,
  Filter
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import type { Lead, LeadStage, PaginatedResponse } from '../types';

const stages: LeadStage[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL',
  'WON',
  'LOST',
];

const stageColors: Record<LeadStage, string> = {
  NEW: '#7c3aed',
  CONTACTED: '#6366f1',
  QUALIFIED: '#f59e0b',
  PROPOSAL: '#ec4899',
  WON: '#10b981',
  LOST: '#ef4444',
};

export function PipelineView() {
  const { token } = useAuth();
  const [leadsByStage, setLeadsByStage] = useState<Record<LeadStage, Lead[]>>({
    NEW: [],
    CONTACTED: [],
    QUALIFIED: [],
    PROPOSAL: [],
    WON: [],
    LOST: [],
  });
  const [loading, setLoading] = useState(true);

  const loadLeads = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api<PaginatedResponse<Lead>>('/leads?limit=100', { token });
      if (res && res.data) {
        const grouped = res.data.reduce((acc, lead) => {
          if (!acc[lead.stage]) acc[lead.stage] = [];
          acc[lead.stage].push(lead);
          return acc;
        }, {
          NEW: [],
          CONTACTED: [],
          QUALIFIED: [],
          PROPOSAL: [],
          WON: [],
          LOST: [],
        } as Record<LeadStage, Lead[]>);
        setLeadsByStage(grouped);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  async function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceStage = source.droppableId as LeadStage;
    const destStage = destination.droppableId as LeadStage;

    const newLeadsByStage = { ...leadsByStage };
    const sourceLeads = [...newLeadsByStage[sourceStage]];
    const destLeads = sourceStage === destStage ? sourceLeads : [...newLeadsByStage[destStage]];
    
    const [movedLead] = sourceLeads.splice(source.index, 1);
    const updatedLead = { ...movedLead, stage: destStage };
    destLeads.splice(destination.index, 0, updatedLead);
    
    newLeadsByStage[sourceStage] = sourceLeads;
    newLeadsByStage[destStage] = destLeads;
    
    setLeadsByStage(newLeadsByStage);

    try {
      await api(`/leads/${draggableId}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ stage: destStage }),
      });
    } catch (err) {
      console.error('Failed to update lead stage:', err);
      void loadLeads(); 
    }
  }

  if (loading && Object.values(leadsByStage).every(arr => arr.length === 0)) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <RefreshCw size={48} className="animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="pipeline-view">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        
        <div className="row-gap">
          <button className="secondary small" onClick={() => void loadLeads()}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualiser
          </button>
          <button className="secondary small">
            <Filter size={14} /> Filtres
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="pipeline-container">
          {stages.map((stage) => (
            <div key={stage} className="pipeline-column">
              <div className="column-header" style={{ borderTop: `4px solid ${stageColors[stage]}` }}>
                <div className="flex-center">
                  <h3>{stage}</h3>
                  <span className="column-count">{leadsByStage[stage].length}</span>
                </div>
                <MoreVertical size={16} className="text-muted" style={{ cursor: 'pointer' }} />
              </div>
              
              <Droppable droppableId={stage}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="column-content"
                    style={{ background: snapshot.isDraggingOver ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                  >
                    {leadsByStage[stage].map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="kanban-card"
                            style={{ 
                              ...provided.draggableProps.style,
                              borderColor: snapshot.isDragging ? stageColors[stage] : 'var(--glass-border)',
                              boxShadow: snapshot.isDragging ? `0 10px 30px -5px ${stageColors[stage]}40` : 'var(--shadow-sm)',
                              zIndex: snapshot.isDragging ? 100 : 1
                            }}
                          >
                            <h4>{lead.firstName} {lead.lastName}</h4>
                            <div className="company">
                              <Building2 size={12} />
                              <span>{lead.company || 'Indépendant'}</span>
                            </div>
                            
                            <div className="footer">
                              <div className="flex-center x-small text-muted">
                                <Calendar size={12} />
                                <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                              </div>
                              {lead.score ? (
                                <div className="badge x-small" style={{ background: `${stageColors[stage]}15`, color: stageColors[stage], padding: '2px 6px', borderRadius: '6px' }}>
                                  Score: {lead.score}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
