import { FieldNode } from "graphql";

export function getFieldNode(fieldNodes: ReadonlyArray<FieldNode>, name: string): FieldNode {
    const fieldNode: FieldNode = fieldNodes.find(node => {
        return node.name.value.toLowerCase() === name.toLowerCase();
    });
    return fieldNode;
}

export function getScalarAttributes(fieldNode: FieldNode): string[] {
    const excludedKeys: string[] = ["__typename"];
    const attributes: string[] = fieldNode.selectionSet.selections
        .filter((selection: FieldNode) => !selection.selectionSet && excludedKeys.indexOf(selection.name.value) === -1)
        .map((selection: FieldNode) => {
            return selection.name.value;
        });
    return attributes;
}

export function getComplexAttributes(fieldNode: FieldNode): string[] {
    const attributes: string[] = fieldNode.selectionSet.selections
        .filter((selection: FieldNode) => !!selection.selectionSet)
        .map((selection: FieldNode) => {
            return selection.name.value;
        });
    return attributes;
}

export interface RelationData {
    fieldName: string;
    attributes: string[];
    relationData?: RelationData[];
}

export function getRelationData(fieldNode: FieldNode): RelationData[] {
    const complexAttributes = getComplexAttributes(fieldNode);
    return complexAttributes.map(nestedFieldName => {
        const complexFieldNode: FieldNode = getFieldNode(fieldNode.selectionSet.selections as ReadonlyArray<FieldNode>, nestedFieldName);
        const nestedScalarAttributes: string[] = getScalarAttributes(complexFieldNode);
        const nestedJoinData = getRelationData(complexFieldNode);
        const rd: RelationData = {
            attributes: nestedScalarAttributes,
            fieldName: nestedFieldName,
            relationData: nestedJoinData
        };
        return rd;
    });
}
