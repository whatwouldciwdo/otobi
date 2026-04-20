import styles from "./HeadquartersBlock.module.css";
import Image from "next/image";

export default function HeadquartersBlock() {
    return (
        <section className={styles.section}>
            
            <div className={styles.imageBackground}>
                
                <div className={styles.imagePlaceholder}>
                    
                    <div className={styles.factoryGraphic}>
                        <span>OTOBI FACTORY</span>
                    </div>
                </div>
            </div>

            
            <div className={styles.darkBlock}>
                <div className={styles.textContent}>
                    <div className={styles.infoBlock}>
                        <h2 className={styles.title}>HEADQUARTERS</h2>
                        <p className={styles.address}>
                            OTOBI Car Care<br/>
                            Jl. Raya Duri Kosambi No.8a<br/>
                            RT.13/RW.7, Cengkareng<br/>
                            Jakarta Barat, 11750<br/>
                            Indonesia
                        </p>
                    </div>

                    <div className={styles.infoBlock}>
                        <h2 className={styles.title}>FACTORY</h2>
                        <p className={styles.address}>
                            OTOBI Car Care<br/>
                            Jl. Raya Duri Kosambi No.8a<br/>
                            RT.13/RW.7, Cengkareng<br/>
                            Jakarta Barat, 11750<br/>
                            Indonesia
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
