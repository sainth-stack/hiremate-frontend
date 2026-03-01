import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box } from '@mui/material';
import SkillCard from './SkillCard';

export default function SortableSkillCard({ skill, index, onUpdate, onRemove, canRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: skill.id || `tech-${index}`, data: { index } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box ref={setNodeRef} style={style} sx={{ mb: 2 }}>
      <SkillCard
        skill={skill}
        index={index}
        onUpdate={onUpdate}
        onRemove={onRemove}
        onDragHandle={{ ...attributes, ...listeners }}
        canRemove={canRemove}
      />
    </Box>
  );
}
