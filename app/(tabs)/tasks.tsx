import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, EmptyState, Eyebrow, Screen, ScreenTitle } from '@/src/components/ui';
import { useAppState } from '@/src/state/AppState';
import { colors, radius, spacing } from '@/src/theme';

export default function TasksScreen() {
  const { tasks, properties, completeTask, pendingAction } = useAppState();
  const [filter, setFilter] = useState<'open' | 'completed'>('open');
  const visible = useMemo(() => tasks.filter((task) => task.status === filter), [tasks, filter]);
  return <Screen>
    <Eyebrow>Operations</Eyebrow><ScreenTitle>Tasks</ScreenTitle>
    <Text style={styles.intro}>Cleaning and maintenance work across your properties.</Text>
    <View style={styles.filters}>
      {(['open', 'completed'] as const).map((item) => <Pressable accessibilityRole="button" accessibilityState={{ selected: filter === item }} key={item} onPress={() => setFilter(item)} style={({ pressed }) => [styles.filter, filter === item && styles.filterActive, pressed && styles.filterPressed]}><Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item === 'open' ? `Open · ${tasks.filter((t) => t.status === 'open').length}` : `Completed · ${tasks.filter((t) => t.status === 'completed').length}`}</Text></Pressable>)}
    </View>
    {visible.length === 0 ? <Card style={styles.emptyCard}><EmptyState icon="checkmark-done-outline" title={filter === 'open' ? 'All caught up' : 'Nothing completed yet'} body={filter === 'open' ? 'There are no open tasks.' : 'Completed tasks will stay here as a clear operational record.'} /></Card> : <View style={styles.list}>{visible.map((task) => {
      const property = properties.find((item) => item.id === task.propertyId);
      const loading = pendingAction === `task:${task.id}`;
      return <Card key={task.id} style={[styles.task, task.overdue && styles.overdue]}>
        <View style={[styles.taskIcon, task.overdue && styles.overdueIcon]}><Ionicons name={task.category === 'Cleaning' ? 'sparkles-outline' : 'construct-outline'} size={20} color={task.overdue ? colors.red : colors.green} /></View>
        <View style={styles.flex}><View style={styles.labelRow}><Text style={styles.category}>{task.category}</Text>{task.overdue && <Text style={styles.overdueLabel}>Overdue</Text>}</View><Text style={styles.taskTitle}>{task.title}</Text><Text style={styles.detail}>{property?.name} · {task.due}</Text><Text style={styles.assignee}>Assigned to {task.assignee}</Text></View>
        {task.status === 'open' ? <Pressable accessibilityRole="button" accessibilityLabel={`Mark ${task.title} complete`} disabled={loading} onPress={() => completeTask(task.id)} style={({ pressed }) => [styles.complete, loading && { opacity: 0.5 }, pressed && { backgroundColor: colors.greenSoft }]}><Ionicons name={loading ? 'hourglass-outline' : 'checkmark'} size={20} color={colors.green} /></Pressable> : <View style={styles.done}><Ionicons name="checkmark" size={17} color="#fff" /></View>}
      </Card>;
    })}</View>}
  </Screen>;
}

const styles = StyleSheet.create({
  intro: { color: colors.inkMuted, fontSize: 14, lineHeight: 21, marginTop: spacing.sm },
  filters: { marginTop: spacing.xl, flexDirection: 'row', backgroundColor: colors.surfaceSoft, padding: 4, borderRadius: radius.md },
  filter: { flex: 1, minHeight: 44, borderRadius: 9, alignItems: 'center', justifyContent: 'center' }, filterActive: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }, filterPressed: { opacity: 0.72 },
  filterText: { color: colors.inkMuted, fontSize: 13, fontWeight: '700' }, filterTextActive: { color: colors.ink },
  list: { marginTop: spacing.lg, gap: spacing.md }, task: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg }, overdue: { borderColor: '#E7C3BF' }, taskIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' }, overdueIcon: { backgroundColor: colors.redSoft },
  flex: { flex: 1 }, labelRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }, category: { color: colors.green, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 }, overdueLabel: { color: colors.red, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  taskTitle: { color: colors.ink, fontSize: 15, lineHeight: 20, fontWeight: '800', marginTop: 6 }, detail: { color: colors.inkMuted, fontSize: 12, marginTop: 5 }, assignee: { color: colors.inkFaint, fontSize: 11, marginTop: 4 },
  complete: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' }, done: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' }, emptyCard: { marginTop: spacing.lg },
});
