import React from 'react';
import {without, contains, union, isNull} from 'lodash';

const DefaultItemComponent = React.createClass({
	render () {
		const firstName = this.props.item.firstName;
		const lastName = this.props.item.lastName;
		return (
			<div>
				<div className="cp-multi-selector-item__icon cps-bg-medium-gray cps-gray-5">{`${firstName[0]}${lastName[0]}`}</div>
				<div className="cp-multi-selector-item__title">{`${firstName} ${lastName}`}</div>
				<div className="cp-multi-selector-item__check">
					<i className="cps-icon cps-icon-lg-check cps-info"></i>
				</div>
			</div>
		)
	}
});

function nearest(element, className) {
	if (!element) return false;
	return element.className.indexOf(className) > -1 || nearest(element.parentElement, className);
}

const MultiSelector = React.createClass({

	componentWillMount: function() {
		document.body.addEventListener('click', this.state.close);
	},

	componentWillUnmount: function() {
		document.body.removeEventListener('click', this.state.close);
	},

	getInitialState: function() {
		return {
			selectedItems: this.props.initialSelectedItems || [],
			dialogDisplayed: false,
			activeIndex: null,
			searchValue: '',
			close: (e) => {
				if (!nearest(e.target, 'cp-multi-selector')) {
					this.setState({
						dialogDisplayed: false
					});
				}
			}
		}
	},

	displayDialog: function(e) {
		this.setState({
			dialogDisplayed: true
		})
	},

	removeItem: function(item, e) {
		this.setState({
			selectedItems: without(this.state.selectedItems, item)
		});

		setTimeout(this.triggerItemChange);
	},

	getItemTitle: function(item) {
		return `${item.firstName} ${item.lastName}`;
	},

	keyUp: function(e) {

		const keycode = e.which;
		const activeIndex = this.state.activeIndex;
		const filterItems = this.getFilterItems(this.props.items);

		if(keycode === 40) { // press down key
			if(isNull(activeIndex)) {
				return this.setState({
					activeIndex: 0
				});
			} else {
				if(activeIndex < filterItems.length - 1) {
					return this.setState({
						activeIndex: activeIndex + 1
					});
				}
			}
		} else if(keycode === 38) { // press up key
			if(!activeIndex) {
				return this.setState({
					activeIndex: 0
				});
			} else {
				if(activeIndex > 0) {
					return this.setState({
						activeIndex: activeIndex - 1
					});
				}
			}
		} else if(keycode === 13) { // press enter key
			if(!isNull(activeIndex)) {
				return this.selectItem(filterItems[activeIndex]);
			}
		} else if(keycode === 27) { // press escape key
			return this.setState({
				activeIndex: null,
				dialogDisplayed: false
			});
		}

		this.setState({
			searchValue: e.target.value
		});
	},

	triggerItemChange: function() {
		if (this.props.onChange) {
			this.props.onChange.call(null, this.state.selectedItems);
		}
	},

	getSelectedClass: function(item) {
		return contains(this.state.selectedItems, item) ? '+selected' : '';
	},

	getActiveClass: function(index) {
		return this.state.activeIndex === index ? '+highlighted' : '';
	},

	getFilterItems: function(items = []) {
		let getItemTitle = this.props.getItemTitle || this.getItemTitle;

		return items
			.filter((item) => {
				return getItemTitle(item).toLowerCase().indexOf(this.state.searchValue.toLowerCase()) > -1;
			})
			.filter((item, index) => {
				return index < 4;
			});
	},

	getSearchItems: function(items = []) {
		let ItemComponent = this.props.ItemComponent || DefaultItemComponent;

		return this.getFilterItems(items).map((item, index) => {
			return (
				<div className={`cp-multi-selector-item ${this.getSelectedClass(item)} ${this.getActiveClass(index)}`} onClick={this.selectItem.bind(this, item)}>
					<ItemComponent item={item}/>
				</div>
			)
		})
	},

	selectItem: function(item, e) {
		let selectedItems = this.state.selectedItems;

		if(contains(selectedItems, item)) {
			this.setState({
				selectedItems: without(selectedItems, item)
			});
		} else {
			this.setState({
				selectedItems: union(selectedItems, [ item ])
			});
		}

		setTimeout(this.triggerItemChange);
	},

	positionDialog: function() {
		setTimeout(() => {
			let el = React.findDOMNode(this);
			let height = el.clientHeight;
			let dialog = el.querySelector('.cp-multi-selector__dialog');

			dialog.style.top = (height + 1) + 'px';

			el.querySelector('.cp-multi-selector__dialog__input').focus();
		}, 100);
	},

	render: function() {
		let getItemTitle = this.props.getItemTitle || this.getItemTitle;

		let pills = this.state.selectedItems
			.map((item) => {
				return (
					<div className="cp-multi-selector__pill cps-white cps-bg-gray-10">
						<span style={{verticalAlign: 'top'}}>{getItemTitle(item)}</span><i onClick={this.removeItem.bind(this, item)} className="cps-icon cps-icon-sm-close"></i>
					</div>
				);
			});

		let dialog;

		if (this.state.dialogDisplayed) {
			dialog = (
				<div className="cp-multi-selector__dialog depth-z2" style={{}}>
					<input onKeyUp={this.keyUp} className="cps-form-control cp-multi-selector__dialog__input" placeholder="Type a collaborators name..."/>
					<div className="cp-multi-selector__dialog__items">
						{this.getSearchItems(this.props.items)}
					</div>
				</div>
			)

			this.positionDialog();
		}

		return (
			<div className='cp-multi-selector'>
				<input type="input" className="cp-multi-selector__hidden-input" onFocus={this.displayDialog}/>
				<div onClick={this.displayDialog} className="cp-multi-selector__main-input cps-form-control">
					{pills}
				</div>
				{dialog}
			</div>
		)
	}
});

if (window && !window.MultiSelector) window.MultiSelector = MultiSelector;

export default MultiSelector;
