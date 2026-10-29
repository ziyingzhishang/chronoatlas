const readerRelationshipLabels: Record<string, string> = {
  founded: '建立', ruled: '统治', served: '任职／效力', appointed: '任用', succeeded: '承接',
  'parent-of': '亲属：父母', 'child-of': '亲属：子女', 'grandparent-of': '亲属：祖父母', 'grandchild-of': '亲属：孙辈',
  'sibling-of': '亲属：兄弟姐妹', 'spouse-of': '亲属：配偶', 'teacher-of': '师承', 'student-of': '弟子',
  'ally-of': '联盟', 'enemy-of': '对立', 'participated-in': '参与事件', 'related-to': '历史关联',
  commissioned: '营建／关联遗产', 'left-heritage': '遗留',
};

export function readerRelationshipLabel(predicate: string) {
  return readerRelationshipLabels[predicate] ?? '历史关联';
}

const readerPersonRelationshipLabels: Record<string, string> = {
  ...readerRelationshipLabels,
  'parent-of': '父母／子女', 'child-of': '子女／父母', 'grandparent-of': '祖父母／外祖父母',
  'grandchild-of': '孙辈／外孙辈', 'spouse-of': '配偶', 'sibling-of': '兄弟姊妹',
  served: '侍奉／效力', 'ally-of': '盟友', 'enemy-of': '对立',
};

export function readerPersonRelationshipLabel(predicate: string) {
  return readerPersonRelationshipLabels[predicate] ?? '历史关联';
}
