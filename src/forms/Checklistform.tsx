import React, { useEffect, useMemo, useState } from "react";
import {
  getGroup,
  getSupplier,
  getSupervisor,
  postChecklistBundle,
} from "../api/endpoints";

/* ---------- Simple inputs (unchanged) ---------- */
const TextInput = ({ label, name, value, onChange, placeholder = "" }) => (
  <div className="mb-4">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
    )}
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

const DatePicker = ({ label, name, value, onChange }) => (
  <div className="mb-4">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
    )}
    <input
      type="date"
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

const Select = ({
  label,
  name,
  value,
  options,
  onChange,
  placeholder = "Select an option",
}) => (
  <div className="mb-4">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
    )}
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">{placeholder}</option>
      {options.map((option, index) => (
        <option
          key={index}
          value={typeof option === "object" ? option.value : option}
        >
          {typeof option === "object" ? option.label : option}
        </option>
      ))}
    </select>
  </div>
);

const Checkbox = ({ label, name, checked, onChange }) => (
  <div className="flex items-center">
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={(e) => onChange({ target: { name, value: e.target.checked } })}
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
    />
    <label className="ml-2 text-sm text-gray-700">{label}</label>
  </div>
);

const Tabs = ({ activeTab, onTabChange, tabs }) => (
  <div className="border-b border-gray-200">
    <nav className="-mb-px flex space-x-8">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === tab.key
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  </div>
);

/* ---------- Types ---------- */
interface DropdownOption {
  id?: string;
  text: string;
  type: "P" | "N";
}
interface BlockQuestion {
  id: string;
  questionName: string;
  answerType: string;
  mandatory: boolean;
  reading: boolean;
  helpText: string;
  dropdownOptions?: DropdownOption[];
  numberConfig?: { min?: number; max?: number; decimals?: boolean };
}
interface GroupBlock {
  id: string;
  groupName: string;
  questions: BlockQuestion[];
}
interface Question {
  id: string;
  questionName: string;
  group: string;
  answerType: string;
  mandatory: boolean;
  reading: boolean;
  helpText: string;
  dropdownOptions?: DropdownOption[];
  numberConfig?: { min?: number; max?: number; decimals?: boolean };
}
interface RemoteGroup {
  id: number;
  name: string;
}
interface RemoteVendor {
  id: number;
  name: string;
}

interface FormData {
  checklistName?: string;
  description?: string;
  frequency?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  priorityLevel?: string;
  questions?: Question[];
  allowedTimeDay?: string;
  allowedTimeHours?: string;
  allowedTimeMinutes?: string;

  supervisors?: string; // ID as string in dropdown
  supplier?: string; // ID as string in dropdown

  extensionTimeDay?: string;
  extensionTimeHours?: string;
  extensionTimeMinutes?: string;

  lockOverdueTask?: string; // "Yes" | "No"
  lockGroupForOverdue?: string[]; // store NAMES
}

interface ChecklistFormProps {
  onClose: () => void;
  onSubmit?: (data: any) => void;
  initialData?: any;
}

/* =================== Component =================== */
export default function ChecklistForm({
  onClose,
  onSubmit,
  initialData,
}: ChecklistFormProps) {
  const [formData, setFormData] = useState<FormData>(
    initialData || {
      lockGroupForOverdue: [],
    }
  );
  const [activeTab, setActiveTab] = useState<string>("Checklist");

  // Remote data
  const [remoteGroups, setRemoteGroups] = useState<RemoteGroup[]>([]);
  const [supplierList, setSupplierList] = useState<RemoteVendor[]>([]);
  const [supervisorList, setSupervisorList] = useState<RemoteVendor[]>([]);

  // Group builder
  const [groupBlocks, setGroupBlocks] = useState<GroupBlock[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [showNewGroupInput, setShowNewGroupInput] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  // Per-question UI configs
  const [currentConfigs, setCurrentConfigs] = useState<{ [key: string]: any }>(
    {}
  );

  // Static options
  const frequencyOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "yearly", label: "Yearly" },
  ];
  const priorityOptions = [
    { value: "1", label: "Low" },
    { value: "2", label: "Mid" },
    { value: "3", label: "High" },
  ];
  const answerTypeOptions = [
    "Text",
    "Number", 
    "Boolean",
    "Date",
    "Time",
    "Multi Choice",
    "Rating",
    "File Upload",
  ];

  /* ------------------ FETCHES ------------------ */
  useEffect(() => {
    (async () => {
      try {
        const groups = await getGroup();
        setRemoteGroups(
          Array.isArray(groups) ? groups : groups?.results ?? groups ?? []
        );
      } catch {}
      try {
        const sups = await getSupplier(); // /vendors/?party_type=supplier
        setSupplierList(
          Array.isArray(sups) ? sups : sups?.results ?? sups ?? []
        );
      } catch {}
      try {
        const supers = await getSupervisor(); // /vendors/?party_type=vendor
        setSupervisorList(
          Array.isArray(supers) ? supers : supers?.results ?? supers ?? []
        );
      } catch {}
    })();
  }, []);

  /* ------------------ HANDLERS ------------------ */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value ? new Date(value) : null }));
  };

  const toggleMulti = (key: keyof FormData, v: string) => {
    setFormData((s) => {
      const curr = new Set<string>([
        ...((s[key] as string[] | undefined) || []),
      ]);
      curr.has(v) ? curr.delete(v) : curr.add(v);
      return { ...s, [key]: Array.from(curr) } as FormData;
    });
  };

  // Group names created in builder
  const createdGroupNames = useMemo(() => {
    const set = new Set<string>();
    formData.questions?.forEach((q) => q.group && set.add(q.group));
    groupBlocks.forEach((b) => b.groupName && set.add(b.groupName));
    return Array.from(set);
  }, [formData.questions, groupBlocks]);

  // Union: API groups + locally created groups (for Lock chips)
  const allGroupNames = useMemo(
    () =>
      Array.from(
        new Set([
          ...(remoteGroups?.map((g) => g.name) || []),
          ...createdGroupNames,
        ])
      ),
    [remoteGroups, createdGroupNames]
  );

  const handleGroupSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "new") setShowNewGroupInput(true);
    else {
      setSelectedGroup(value);
      setShowNewGroupInput(false);
    }
  };
  const addNewGroup = () => {
    if (newGroupName.trim()) {
      setSelectedGroup(newGroupName.trim());
      setShowNewGroupInput(false);
      setNewGroupName("");
    }
  };

  const createEmptyQuestion = (): BlockQuestion => ({
    id: Date.now().toString() + Math.random(),
    questionName: "",
    answerType: "",
    mandatory: false,
    reading: false,
    helpText: "",
    dropdownOptions: undefined,
  });

  const addNewGroupBlock = () => {
    const newBlock: GroupBlock = {
      id: Date.now().toString(),
      groupName: selectedGroup || `Group ${groupBlocks.length + 1}`,
      questions: [createEmptyQuestion()],
    };
    setGroupBlocks((g) => [...g, newBlock]);
    setSelectedGroup("");
  };
  const removeGroupBlock = (blockId: string) =>
    setGroupBlocks((g) => g.filter((b) => b.id !== blockId));
  const addQuestionToBlock = (blockId: string) =>
    setGroupBlocks((g) =>
      g.map((b) =>
        b.id === blockId
          ? { ...b, questions: [...b.questions, createEmptyQuestion()] }
          : b
      )
    );
  const removeQuestion = (blockId: string, qid: string) =>
    setGroupBlocks((g) =>
      g.map((b) =>
        b.id === blockId
          ? { ...b, questions: b.questions.filter((q) => q.id !== qid) }
          : b
      )
    );

  const handleQuestionUpdate = (
    blockId: string,
    qid: string,
    field: string,
    value: any
  ) => {
    setGroupBlocks((g) =>
      g.map((b) =>
        b.id === blockId
          ? {
              ...b,
              questions: b.questions.map((q) =>
                q.id === qid ? { ...q, [field]: value } : q
              ),
            }
          : b
      )
    );

    if (field === "answerType" && value === "Multi Choice") {
      const configKey = `${blockId}-${qid}`;
      const four = [0, 1, 2, 3].map((i) => ({
        id: `${i}`,
        text: "",
        type: "P" as const,
      }));
      setCurrentConfigs((c) => ({
        ...c,
        [configKey]: { ...(c[configKey] || {}), dropdownOptions: four },
      }));
      handleQuestionUpdate(blockId, qid, "dropdownOptions", four);
    }
  };

  const handleAddGroup = () => {
    const all: Question[] = [];
    groupBlocks.forEach((block) => {
      block.questions.forEach((q) => {
        if (q.questionName && q.answerType) {
          all.push({
            id: q.id,
            questionName: q.questionName,
            group: block.groupName,
            answerType: q.answerType,
            mandatory: q.mandatory,
            reading: q.reading,
            helpText: q.helpText,
            dropdownOptions: q.dropdownOptions,
            numberConfig: q.numberConfig,
          });
        }
      });
    });
    setFormData((s) => ({ ...s, questions: all }));
    setGroupBlocks([]);
  };

  // Dropdown option helpers
  const updateDropdownOption = (
    blockId: string,
    qid: string,
    index: number,
    text: string,
    type: "P" | "N"
  ) => {
    const key = `${blockId}-${qid}`;
    const curr = currentConfigs[key]?.dropdownOptions || [
      { text: "", type: "P" },
      { text: "", type: "N" },
    ];
    const next = [...curr];
    next[index] = { id: `${index}`, text, type };
    setCurrentConfigs((c) => ({
      ...c,
      [key]: { ...(c[key] || {}), dropdownOptions: next },
    }));
    handleQuestionUpdate(
      blockId,
      qid,
      "dropdownOptions",
      next.filter((o) => o.text)
    );
  };
  const addDropdownOptionToQuestion = (blockId: string, qid: string) => {
    const key = `${blockId}-${qid}`;
    const curr = currentConfigs[key]?.dropdownOptions || [];
    const next = [
      ...curr,
      { id: String(curr.length), text: "", type: "P" as const },
    ];
    setCurrentConfigs((c) => ({
      ...c,
      [key]: { ...(c[key] || {}), dropdownOptions: next },
    }));
  };
  const removeDropdownOptionByIndex = (
    blockId: string,
    qid: string,
    index: number
  ) => {
    const key = `${blockId}-${qid}`;
    const curr = currentConfigs[key]?.dropdownOptions || [];
    const next = curr.filter((_, i) => i !== index);
    setCurrentConfigs((c) => ({
      ...c,
      [key]: { ...(c[key] || {}), dropdownOptions: next },
    }));
    handleQuestionUpdate(
      blockId,
      qid,
      "dropdownOptions",
      next.filter((o) => o.text)
    );
  };

  /* ------------------ SUBMIT ------------------ */
  const toHHMMSS = (d?: string, h?: string, m?: string) => {
    const dd = Math.max(parseInt(d || "0"), 0);
    const hh = Math.max(parseInt(h || "0"), 0);
    const mm = Math.max(parseInt(m || "0"), 0);
    const total = dd * 24 * 60 + hh * 60 + mm;
    const H = Math.floor(total / 60);
    const M = total % 60;
    const S = 0;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(H)}:${pad(M)}:${pad(S)}`;
  };
  
  const toISO = (d: Date) =>
    new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
      .toISOString()
      .slice(0, 10);

  const buildPayload = () => {
    const groupsOrdered = groupBlocks
      .map((b, i) => {
        const found = remoteGroups.find(
          (rg) => rg.name?.toLowerCase() === b.groupName?.toLowerCase()
        );
        return found ? { group: found.id, order: i + 1 } : { group: null, order: i };
      });

    const questions: any[] = [];
    groupBlocks.forEach((block, section_idx) => {
      block.questions.forEach((q, qi) => {
        const base: any = {
          section_idx,
          text: q.questionName,
          help_text: q.helpText || "",
          required: !!q.mandatory,
          priority: parseInt(formData.priorityLevel || "2") || 2,
          order: qi + 1,
        };
        
        switch (q.answerType) {
          case "Text":
            questions.push({ 
              ...base, 
              response_type: "text"
            });
            break;
          case "Number":
            questions.push({
              ...base,
              response_type: "number",
              min_value: q.numberConfig?.min ?? undefined,
              max_value: q.numberConfig?.max ?? undefined,
            });
            break;
          case "Boolean":
            questions.push({ 
              ...base, 
              response_type: "boolean",
              render_as: "TOGGLE"
            });
            break;
          case "Date":
            questions.push({ ...base, response_type: "date" });
            break;
          case "Time":
            questions.push({ ...base, response_type: "time" });
            break;
          case "Multi Choice":
            questions.push({
              ...base,
              response_type: "multi_select",
              render_as: "CHECKBOX_GROUP",
              options: (q.dropdownOptions || [])
                .filter((o) => o.text)
                .map((o, idx) => ({
                  name: o.text,
                  value: o.text.toLowerCase().replace(/\s+/g, '_'),
                  order: idx + 1,
                  score_value: o.type === "P" ? 1 : 0,
                })),
            });
            break;
          default:
            questions.push({ ...base, response_type: "text" });
        }
      });
    });

    const lockedGroupIds = (formData.lockGroupForOverdue || [])
      .map((name) => remoteGroups.find((rg) => rg.name === name)?.id)
      .filter((x) => x != null) as number[];

    return {
      checklist: {
        name: formData.checklistName || "",
        description: formData.description || "",
        start_date: formData.startDate ? toISO(formData.startDate) : null,
        end_date: formData.endDate ? toISO(formData.endDate) : null,
        priority: parseInt(formData.priorityLevel || "2") || 2,
        frequency: formData.frequency || "DAILY",
      },
      groups: groupsOrdered,
      questions,
      cron_settings: {
        allowed_time_to_submit: toHHMMSS(
          formData.allowedTimeDay,
          formData.allowedTimeHours,
          formData.allowedTimeMinutes
        ),
        extension_time: toHHMMSS(
          formData.extensionTimeDay,
          formData.extensionTimeHours,
          formData.extensionTimeMinutes
        ),
        lock_overdue_task: formData.lockOverdueTask === "Yes",
        locked_group_ids: lockedGroupIds,
      },
    };
  };

  const handleSubmit = async () => {
    const payload = buildPayload();
    try {
      const resp = await postChecklistBundle(payload);
      onSubmit && onSubmit(resp);
    } catch (e: any) {
      onSubmit && onSubmit({ error: true, message: e?.message, payload });
    } finally {
      onClose();
    }
  };

  /* ------------------ RENDER ------------------ */
  return (
    <div
      className="p-6 bg-white rounded shadow-md w-full h-full overflow-y-auto"
      style={{ fontFamily: "'PT Sans', sans-serif" }}
    >
      <Tabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          { key: "Assets", label: "Assets" },
          { key: "AMC", label: "AMC" },
          { key: "Checklist", label: "Checklist" },
          { key: "PPM", label: "PPM" },
          { key: "Stock Items", label: "Stock Items" },
        ]}
      />

      {/* Section 1: Checklist Info */}
      <div className="mt-6">
        <div className="bg-gray-200 text-center py-3 rounded mb-4">
          <h2 className="text-xl font-bold text-gray-800">Checklist Info</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TextInput
            label="Checklist Name"
            name="checklistName"
            value={formData.checklistName || ""}
            onChange={handleChange}
            placeholder="Enter checklist name"
          />
          <TextInput
            label="Description"
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="Enter description"
          />
          <Select
            label="Frequency"
            name="frequency"
            value={formData.frequency || ""}
            options={frequencyOptions}
            onChange={handleChange}
            placeholder="Select frequency"
          />
          <DatePicker
            label="Start Date"
            name="startDate"
            value={
              formData.startDate
                ? formData.startDate.toISOString().split("T")[0]
                : ""
            }
            onChange={handleDateChange}
          />
          <DatePicker
            label="End Date"
            name="endDate"
            value={
              formData.endDate
                ? formData.endDate.toISOString().split("T")[0]
                : ""
            }
            onChange={handleDateChange}
          />
          <div className="md:col-span-2 lg:col-span-1">
            <Select
              label="Priority Level"
              name="priorityLevel"
              value={formData.priorityLevel || ""}
              options={priorityOptions}
              onChange={handleChange}
              placeholder="Select priority"
            />
          </div>
        </div>

        {/* Group Builder Section */}
        <div className="mt-8 border border-gray-300 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Add Questions Groups</h3>

          <div className="mb-4 flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Group
              </label>
              <select
                value={selectedGroup}
                onChange={handleGroupSelection}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select existing group</option>
                {remoteGroups.map((g) => (
                  <option key={g.id} value={g.name}>
                    {g.name}
                  </option>
                ))}
                <option value="new">+ Create New Group</option>
              </select>
            </div>

            {showNewGroupInput && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Group Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Enter group name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addNewGroup}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={addNewGroupBlock}
              disabled={!selectedGroup && !showNewGroupInput}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Group
            </button>
          </div>

          {/* Group Blocks */}
          {groupBlocks.map((block) => (
            <div
              key={block.id}
              className="border border-gray-200 rounded-lg p-4 mb-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-lg">{block.groupName}</h4>
                <button
                  type="button"
                  onClick={() => removeGroupBlock(block.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove Group
                </button>
              </div>

              {/* Questions in this group */}
              {block.questions.map((q) => (
                <div
                  key={q.id}
                  className="border border-gray-100 rounded p-3 mb-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <TextInput
                      label="Question Name"
                      name="questionName"
                      value={q.questionName}
                      onChange={(e) =>
                        handleQuestionUpdate(
                          block.id,
                          q.id,
                          "questionName",
                          e.target.value
                        )
                      }
                    />
                    <Select
                      label="Answer Type"
                      name="answerType"
                      value={q.answerType}
                      options={answerTypeOptions}
                      onChange={(e) =>
                        handleQuestionUpdate(
                          block.id,
                          q.id,
                          "answerType",
                          e.target.value
                        )
                      }
                    />
                    <TextInput
                      label="Help Text"
                      name="helpText"
                      value={q.helpText}
                      onChange={(e) =>
                        handleQuestionUpdate(
                          block.id,
                          q.id,
                          "helpText",
                          e.target.value
                        )
                      }
                      placeholder="Enter help text"
                    />
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <Checkbox
                      label="Mandatory"
                      name="mandatory"
                      checked={q.mandatory}
                      onChange={(e) =>
                        handleQuestionUpdate(
                          block.id,
                          q.id,
                          "mandatory",
                          e.target.value
                        )
                      }
                    />
                    <Checkbox
                      label="Reading"
                      name="reading"
                      checked={q.reading}
                      onChange={(e) =>
                        handleQuestionUpdate(
                          block.id,
                          q.id,
                          "reading",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {/* Number Config */}
                  {q.answerType === "Number" && (
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <TextInput
                        label="Min Value"
                        name="minValue"
                        value={q.numberConfig?.min?.toString() || ""}
                        onChange={(e) =>
                          handleQuestionUpdate(
                            block.id,
                            q.id,
                            "numberConfig",
                            { 
                              ...q.numberConfig, 
                              min: e.target.value ? parseInt(e.target.value) : undefined 
                            }
                          )
                        }
                        placeholder="0"
                      />
                      <TextInput
                        label="Max Value"
                        name="maxValue"
                        value={q.numberConfig?.max?.toString() || ""}
                        onChange={(e) =>
                          handleQuestionUpdate(
                            block.id,
                            q.id,
                            "numberConfig",
                            { 
                              ...q.numberConfig, 
                              max: e.target.value ? parseInt(e.target.value) : undefined 
                            }
                          )
                        }
                        placeholder="100"
                      />
                    </div>
                  )}

                  {/* Multi Choice Options */}
                  {q.answerType === "Multi Choice" && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options
                      </label>
                      {(
                        currentConfigs[`${block.id}-${q.id}`]
                          ?.dropdownOptions || []
                      ).map((opt, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) =>
                              updateDropdownOption(
                                block.id,
                                q.id,
                                idx,
                                e.target.value,
                                opt.type
                              )
                            }
                            placeholder="Option text"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                          />
                          <select
                            value={opt.type}
                            onChange={(e) =>
                              updateDropdownOption(
                                block.id,
                                q.id,
                                idx,
                                opt.text,
                                e.target.value as "P" | "N"
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="P">Positive</option>
                            <option value="N">Negative</option>
                          </select>
                          <button
                            type="button"
                            onClick={() =>
                              removeDropdownOptionByIndex(block.id, q.id, idx)
                            }
                            className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          addDropdownOptionToQuestion(block.id, q.id)
                        }
                        className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                      >
                        Add Option
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => removeQuestion(block.id, q.id)}
                    className="mt-2 text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove Question
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addQuestionToBlock(block.id)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add Question
              </button>
            </div>
          ))}

          {groupBlocks.length > 0 && (
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={handleAddGroup}
                className="px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700"
              >
                Add All Groups to Checklist
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Schedules */}
      <div className="mt-8">
        <div className="bg-gray-200 text-center py-3 rounded mb-4">
          <h2 className="text-xl font-bold text-gray-800">Schedules</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Allowed time to submit
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <TextInput
                  name="allowedTimeDay"
                  value={formData.allowedTimeDay || ""}
                  onChange={handleChange}
                  placeholder="Days"
                />
              </div>
              <div className="flex-1">
                <TextInput
                  name="allowedTimeHours"
                  value={formData.allowedTimeHours || ""}
                  onChange={handleChange}
                  placeholder="Hours"
                />
              </div>
              <div className="flex-1">
                <TextInput
                  name="allowedTimeMinutes"
                  value={formData.allowedTimeMinutes || ""}
                  onChange={handleChange}
                  placeholder="Minutes"
                />
              </div>
            </div>
          </div>

          <Select
            label="Supervisors"
            name="supervisors"
            value={formData.supervisors || ""}
            options={(supervisorList || []).map((v) => ({
              value: String(v.id),
              label: v.name,
            }))}
            onChange={handleChange}
            placeholder="Select supervisor"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Extension Time
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <TextInput
                  name="extensionTimeDay"
                  value={formData.extensionTimeDay || ""}
                  onChange={handleChange}
                  placeholder="Days"
                />
              </div>
              <div className="flex-1">
                <TextInput
                  name="extensionTimeHours"
                  value={formData.extensionTimeHours || ""}
                  onChange={handleChange}
                  placeholder="Hours"
                />
              </div>
              <div className="flex-1">
                <TextInput
                  name="extensionTimeMinutes"
                  value={formData.extensionTimeMinutes || ""}
                  onChange={handleChange}
                  placeholder="Minutes"
                />
              </div>
            </div>
          </div>

          <Select
            label="Supplier"
            name="supplier"
            value={formData.supplier || ""}
            options={(supplierList || []).map((v) => ({
              value: String(v.id),
              label: v.name,
            }))}
            onChange={handleChange}
            placeholder="Select supplier"
          />

          <Select
            label="Lock Overdue Task"
            name="lockOverdueTask"
            value={formData.lockOverdueTask || ""}
            options={["Yes", "No"]}
            onChange={handleChange}
            placeholder="Select option"
          />

          {formData.lockOverdueTask === "Yes" && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lock groups
              </label>
              {allGroupNames.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No groups yet. Add a Checklist Group above.
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {allGroupNames.map((g) => {
                    const checked =
                      formData.lockGroupForOverdue?.includes(g) || false;
                    return (
                      <label
                        key={g}
                        className={`px-3 py-1.5 rounded-full border cursor-pointer ${
                          checked
                            ? "bg-blue-600 text-white border-blue-600"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={checked}
                          onChange={() => toggleMulti("lockGroupForOverdue", g)}
                        />
                        {g}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Save / Cancel */}
      <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
        <button
          type="button"
          className="px-6 py-2 bg-gray-300 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="px-6 py-2 text-white font-medium rounded-md shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-opacity"
          style={{ backgroundColor: "#0A2E6D" }}
          onClick={handleSubmit}
        >
          Save Checklist
        </button>
      </div>
    </div>
  );
}