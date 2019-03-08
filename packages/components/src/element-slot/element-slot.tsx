import { Color } from '../colors';
import { ElementAnchors } from '../element';
import { Icon, IconSize } from '../icons';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';
import { ChevronRight } from 'react-feather';

export enum ElementSlotState {
	Default = 'default',
	Disabled = 'disabled',
	Highlighted = 'highlighted'
}

export interface ElementSlotProps {
	children?: React.ReactNode;
	description: string;
	id: string;
	open: boolean;
	state: ElementSlotState;
	title: string;
}

interface StyledElementSlotLabelProps {
	state: ElementSlotState;
}

interface StyledIconProps {
	open: boolean;
}

const StyledElementSlot = styled.div`
	position: relative;
	z-index: 1;
`;

const LABEL_COLOR = (props: StyledElementSlotLabelProps): string => {
	switch (props.state) {
		case ElementSlotState.Disabled:
			return Color.Grey60;
		case ElementSlotState.Highlighted:
		case ElementSlotState.Default:
		default:
			return 'inherit';
	}
};

const LABEL_BACKGROUND = (props: StyledElementSlotLabelProps): string => {
	switch (props.state) {
		case ElementSlotState.Highlighted:
			return Color.Grey90;
		default:
			return 'transparent';
	}
};

const StyledElementSlotLabel = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	font-size: 15px;
	line-height: 21px;
	z-index: 1;
	color: ${LABEL_COLOR};
	background: ${LABEL_BACKGROUND};
`;

const StyledElementChildren = styled.div`
	flex-basis: 100%;
	padding-left: ${getSpace(SpaceSize.L)}px;
`;

const StyledIconWrapper = styled.div`
	position: absolute;
	left: ${getSpace(SpaceSize.S)}px;
	transition: transform 0.2s;
	height: 100%;
	width: ${IconSize.XS}px;
	display: flex;
	align-items: center;
`;

const StyledIcon = styled(ChevronRight)`
	stroke: none;
	fill: ${Color.Grey60};
	transition: transform 0.2s;
	${(props: StyledIconProps) => (props.open ? 'transform: rotate(90deg)' : '')};
`;

const StyledElementSlotLabelContent = styled.div`
	box-sizing: border-box;
	margin-left: ${getSpace(SpaceSize.XXL) - 3}px;
	overflow: hidden;
	padding: ${getSpace(SpaceSize.XS)}px ${getSpace(SpaceSize.XXS)}px;
	text-overflow: ellipsis;
	white-space: nowrap;
	width: 100%;
`;

const StyledElementSlotLabelDescription = styled.div`
	box-sizing: border-box;
	padding: 0 ${getSpace(SpaceSize.M)}px 0 ${getSpace(SpaceSize.XS)}px;
	font-size: 12px;
	justify-self: flex-end;
`;

export class ElementSlot extends React.Component<ElementSlotProps> {
	public render(): JSX.Element | null {
		const { props } = this;

		return (
			<StyledElementSlot {...{ [ElementAnchors.content]: props.id }}>
				<StyledElementSlotLabel state={props.state}>
					<StyledIconWrapper>
						<StyledIcon size={IconSize.XS} open={props.open} />
					</StyledIconWrapper>
					<StyledElementSlotLabelContent {...{ [ElementAnchors.label]: true }}>
						{props.title}
					</StyledElementSlotLabelContent>
					<StyledElementSlotLabelDescription>
						{props.description}
					</StyledElementSlotLabelDescription>
				</StyledElementSlotLabel>
				<StyledElementChildren>{props.open && props.children}</StyledElementChildren>
			</StyledElementSlot>
		);
	}
}
