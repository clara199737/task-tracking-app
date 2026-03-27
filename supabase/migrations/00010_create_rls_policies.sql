-- Helper functions
CREATE OR REPLACE FUNCTION public.get_user_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- SCHOOLS
CREATE POLICY "schools_select" ON public.schools
  FOR SELECT USING (id = public.get_user_school_id());

CREATE POLICY "schools_update" ON public.schools
  FOR UPDATE USING (id = public.get_user_school_id() AND public.get_user_role() = 'owner');

-- PROFILES
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR school_id = public.get_user_school_id());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- STUDENTS
CREATE POLICY "students_select" ON public.students
  FOR SELECT USING (school_id = public.get_user_school_id());

CREATE POLICY "students_insert" ON public.students
  FOR INSERT WITH CHECK (school_id = public.get_user_school_id());

CREATE POLICY "students_update" ON public.students
  FOR UPDATE USING (school_id = public.get_user_school_id());

CREATE POLICY "students_delete" ON public.students
  FOR DELETE USING (school_id = public.get_user_school_id() AND public.get_user_role() = 'owner');

-- CATEGORIES
CREATE POLICY "categories_select" ON public.categories
  FOR SELECT USING (school_id = public.get_user_school_id());

CREATE POLICY "categories_insert" ON public.categories
  FOR INSERT WITH CHECK (school_id = public.get_user_school_id() AND public.get_user_role() = 'owner');

CREATE POLICY "categories_update" ON public.categories
  FOR UPDATE USING (school_id = public.get_user_school_id() AND public.get_user_role() = 'owner');

CREATE POLICY "categories_delete" ON public.categories
  FOR DELETE USING (school_id = public.get_user_school_id() AND public.get_user_role() = 'owner');

-- TASKS
CREATE POLICY "tasks_select" ON public.tasks
  FOR SELECT USING (school_id = public.get_user_school_id());

CREATE POLICY "tasks_insert" ON public.tasks
  FOR INSERT WITH CHECK (school_id = public.get_user_school_id());

CREATE POLICY "tasks_update" ON public.tasks
  FOR UPDATE USING (
    school_id = public.get_user_school_id()
    AND (
      public.get_user_role() = 'owner'
      OR created_by = auth.uid()
      OR id IN (SELECT task_id FROM public.task_assignments WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "tasks_delete" ON public.tasks
  FOR DELETE USING (
    school_id = public.get_user_school_id()
    AND (public.get_user_role() = 'owner' OR created_by = auth.uid())
  );

-- CHECKLIST ITEMS (inherit task access)
CREATE POLICY "checklist_items_select" ON public.checklist_items
  FOR SELECT USING (
    task_id IN (SELECT id FROM public.tasks WHERE school_id = public.get_user_school_id())
  );

CREATE POLICY "checklist_items_insert" ON public.checklist_items
  FOR INSERT WITH CHECK (
    task_id IN (SELECT id FROM public.tasks WHERE school_id = public.get_user_school_id())
  );

CREATE POLICY "checklist_items_update" ON public.checklist_items
  FOR UPDATE USING (
    task_id IN (SELECT id FROM public.tasks WHERE school_id = public.get_user_school_id())
  );

CREATE POLICY "checklist_items_delete" ON public.checklist_items
  FOR DELETE USING (
    task_id IN (SELECT id FROM public.tasks WHERE school_id = public.get_user_school_id())
  );

-- TASK ASSIGNMENTS
CREATE POLICY "task_assignments_select" ON public.task_assignments
  FOR SELECT USING (
    task_id IN (SELECT id FROM public.tasks WHERE school_id = public.get_user_school_id())
  );

CREATE POLICY "task_assignments_insert" ON public.task_assignments
  FOR INSERT WITH CHECK (
    task_id IN (SELECT id FROM public.tasks WHERE school_id = public.get_user_school_id())
  );

CREATE POLICY "task_assignments_delete" ON public.task_assignments
  FOR DELETE USING (
    task_id IN (SELECT id FROM public.tasks WHERE school_id = public.get_user_school_id())
  );

-- RECURRING RULES
CREATE POLICY "recurring_rules_select" ON public.recurring_rules
  FOR SELECT USING (school_id = public.get_user_school_id());

CREATE POLICY "recurring_rules_insert" ON public.recurring_rules
  FOR INSERT WITH CHECK (school_id = public.get_user_school_id());

CREATE POLICY "recurring_rules_update" ON public.recurring_rules
  FOR UPDATE USING (school_id = public.get_user_school_id());

CREATE POLICY "recurring_rules_delete" ON public.recurring_rules
  FOR DELETE USING (school_id = public.get_user_school_id() AND public.get_user_role() = 'owner');

-- NOTIFICATIONS (user's own only)
CREATE POLICY "notifications_select" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "notifications_delete" ON public.notifications
  FOR DELETE USING (user_id = auth.uid());
