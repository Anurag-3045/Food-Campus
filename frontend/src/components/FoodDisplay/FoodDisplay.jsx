import React, { useContext } from 'react'
import './FoodDisplay.css'
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';
import { food_list as staticFoodList } from '../../assets/assets';

const normalizeCategory = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "maim course") return "main course";
  return normalized;
};

const FoodDisplay = ({category}) => {

    const {food_list} = useContext(StoreContext);

    const selectedCategory = normalizeCategory(category);
    const staticCategoryByName = new Map(
      staticFoodList.map((item) => [String(item.name || "").trim().toLowerCase(), item.category])
    );
  return (
    <div className='food-display' id='food-display'>
        <h2>Top Dishes near you</h2>
        <div className="food-display-list">
            {food_list.map((item,index)=>{
              const itemName = String(item.name || "").trim().toLowerCase();
              const effectiveCategory = staticCategoryByName.get(itemName) || item.category;
              const itemCategory = normalizeCategory(effectiveCategory);

              if(selectedCategory === "all" || selectedCategory === itemCategory){
                return <FoodItem key={index} id={item._id} name={item.name} description={item.description} price={item.price} image={item.image}/>
              }
            })}
        </div>
      
    </div>
  )
}

export default FoodDisplay
