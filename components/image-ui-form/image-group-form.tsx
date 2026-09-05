'use client';

import type { ComponentProps } from 'react';

import type { ImageFormType } from './image-context-provider';
import ImageForm from './image-form';

export interface ImageGroupFormProps {
  formType: ImageFormType;
  formTitle?: string;
  submitBtnId: string;
  slotNode?: ComponentProps<typeof ImageForm>['slotNode'];
  slotNodeFunc?: ComponentProps<typeof ImageForm>['slotNodeFunc'];
  slotNodeFuncAfterInput?: ComponentProps<typeof ImageForm>['slotNodeFuncAfterInput'];
  styleName?: ComponentProps<typeof ImageForm>['styleName'];
  moreFormSchema?: ComponentProps<typeof ImageForm>['moreFormSchema'];
  defaultValues?: ComponentProps<typeof ImageForm>['defaultValues'];
  defaultValuePriority?: ComponentProps<typeof ImageForm>['defaultValuePriority'];
  imageUploadMode?: ComponentProps<typeof ImageForm>['imageUploadMode'];
  showModelVersion?: ComponentProps<typeof ImageForm>['showModelVersion'];
  formatPrompt?: ComponentProps<typeof ImageForm>['formatPrompt'];
  showRatio?: ComponentProps<typeof ImageForm>['showRatio'];
  showPromptInput?: ComponentProps<typeof ImageForm>['showPromptInput'];
  promptTitle?: ComponentProps<typeof ImageForm>['promptTitle'];
  imageTemplateList?: ComponentProps<typeof ImageForm>['imageTemplateList'];
  slotNodeAfter?: ComponentProps<typeof ImageForm>['slotNodeAfter'];
  onResetAll?: ComponentProps<typeof ImageForm>['onResetAll'];
}

/**
 * Image Group Form - 图片生成页面的统一布局组件
 *
 * TODO: 删除本组件，直接使用 ImageForm 组件
 */
export default function ImageGroupForm({
  formType,
  formTitle,
  submitBtnId,
  slotNode,
  slotNodeFunc,
  slotNodeFuncAfterInput,
  styleName,
  moreFormSchema,
  defaultValues,
  defaultValuePriority,
  imageUploadMode,
  showModelVersion,
  formatPrompt,
  showRatio = true,
  showPromptInput = true,
  promptTitle,
  imageTemplateList,
  slotNodeAfter,
  onResetAll,
}: ImageGroupFormProps) {
  return (
    <ImageForm
      imageFormType={formType}
      formTitle={formTitle}
      submitBtnId={submitBtnId}
      slotNode={slotNode}
      styleName={styleName}
      moreFormSchema={moreFormSchema}
      defaultValues={defaultValues}
      defaultValuePriority={defaultValuePriority}
      imageUploadMode={imageUploadMode}
      formatPrompt={formatPrompt}
      showRatio={showRatio}
      showPromptInput={showPromptInput}
      promptTitle={promptTitle}
      showModelVersion={showModelVersion}
      slotNodeFunc={slotNodeFunc}
      slotNodeFuncAfterInput={slotNodeFuncAfterInput}
      imageTemplateList={imageTemplateList}
      slotNodeAfter={slotNodeAfter}
      onResetAll={onResetAll}
    />
  );
}
